#!/usr/bin/env python3
"""
YouTube Quality Selection using pytubefix
This script provides multiple quality options for YouTube videos
"""

import sys
import json
import argparse
from pytubefix import YouTube

def get_video_qualities(url):
    """Get all available quality options for a YouTube video"""
    try:
        # Create YouTube object
        yt = YouTube(url)
        
        # Get all available streams
        streams = yt.streams
        
        # Extract quality information
        quality_options = []
        
        # Video streams with quality info
        for stream in streams:
            if hasattr(stream, 'resolution') and stream.resolution:
                quality_info = {
                    'itag': stream.itag,
                    'resolution': stream.resolution,
                    'filesize': stream.filesize,
                    'mime_type': stream.mime_type,
                    'type': 'video',
                    'url': stream.url if hasattr(stream, 'url') else None
                }
                quality_options.append(quality_info)
        
        # Audio-only streams
        audio_streams = yt.streams.filter(only_audio=True)
        for stream in audio_streams:
            quality_info = {
                'itag': stream.itag,
                'resolution': 'audio_only',
                'filesize': stream.filesize,
                'mime_type': stream.mime_type,
                'type': 'audio',
                'url': stream.url if hasattr(stream, 'url') else None
            }
            quality_options.append(quality_info)
        
        # Sort by resolution (numeric)
        def sort_key(stream):
            if stream['resolution'] == 'audio_only':
                return 0
            try:
                return int(stream['resolution'].replace('p', ''))
            except:
                return 0
        
        quality_options.sort(key=sort_key, reverse=True)
        
        # Get video metadata
        video_info = {
            'title': yt.title,
            'author': yt.author,
            'length': yt.length,
            'views': yt.views,
            'thumbnail': yt.thumbnail_url,
            'qualities': quality_options
        }
        
        return video_info
        
    except Exception as e:
        return {'error': str(e)}

def download_video(url, quality, output_path=None):
    """Download video at specific quality"""
    try:
        yt = YouTube(url)
        
        # Get stream based on quality
        if quality == 'highest':
            stream = yt.streams.get_highest_resolution()
        elif quality == 'lowest':
            stream = yt.streams.get_lowest_resolution()
        elif quality == 'audio':
            stream = yt.streams.get_audio_only()
        else:
            # Try to get specific resolution
            stream = yt.streams.filter(res=quality).first()
            if not stream:
                # Fallback to closest quality
                available_resolutions = [s.resolution for s in yt.streams if s.resolution]
                available_resolutions = [r for r in available_resolutions if r and r != 'audio_only']
                available_resolutions.sort(key=lambda x: int(x.replace('p', '')))
                
                # Find closest quality
                target_height = int(quality.replace('p', ''))
                closest = min(available_resolutions, key=lambda x: abs(int(x.replace('p', '')) - target_height))
                stream = yt.streams.filter(res=closest).first()
        
        if not stream:
            return {'error': f'No stream found for quality {quality}'}
        
        # Download the video
        if output_path:
            file_path = stream.download(output_path=output_path)
        else:
            file_path = stream.download()
        
        return {
            'success': True,
            'file_path': file_path,
            'quality': stream.resolution,
            'filesize': stream.filesize,
            'mime_type': stream.mime_type
        }
        
    except Exception as e:
        return {'error': str(e)}

def main():
    # Add debugging
    print(f"DEBUG: Python script started with args: {sys.argv}", file=sys.stderr)
    print(f"DEBUG: Python version: {sys.version}", file=sys.stderr)
    
    parser = argparse.ArgumentParser(description='YouTube Quality Selection and Download')
    parser.add_argument('url', help='YouTube video URL')
    parser.add_argument('--action', choices=['qualities', 'download'], default='qualities',
                        help='Action to perform: get qualities or download')
    parser.add_argument('--quality', help='Quality for download (e.g., 720p, 1080p, highest, lowest, audio)')
    parser.add_argument('--output', help='Output directory for download')

    args = parser.parse_args()
    
    if args.action == 'qualities':
        # Get available qualities
        print(f"DEBUG: Getting qualities for URL: {args.url}", file=sys.stderr)
        result = get_video_qualities(args.url)
        print(json.dumps(result, indent=2))

    elif args.action == 'download':
        if not args.quality:
            print(json.dumps({'error': 'Quality parameter required for download'}, indent=2))
            sys.exit(1)

        # Download video
        print(f"DEBUG: Downloading with quality: {args.quality} for URL: {args.url}", file=sys.stderr)
        result = download_video(args.url, args.quality, args.output)
        print(json.dumps(result, indent=2))

    else:
        print(json.dumps({'error': 'Invalid action'}, indent=2))
        sys.exit(1)

if __name__ == '__main__':
    main()
