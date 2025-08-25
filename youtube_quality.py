#!/usr/bin/env python
"""
YouTube Quality Selection using pytubefix
This script provides multiple quality options for YouTube videos
"""

import sys
import json
import argparse
import os
from pytubefix import YouTube
from pytubefix.exceptions import VideoUnavailable, RegexMatchError

def get_video_qualities(url):
    """Get available video qualities for a YouTube video"""
    try:
        print(f"DEBUG: Creating YouTube object for URL: {url}", file=sys.stderr)
        
        # Use po_token to avoid bot detection
        yt = YouTube(url, use_po_token=True)
        
        print(f"DEBUG: YouTube object created successfully", file=sys.stderr)
        print(f"DEBUG: Video title: {yt.title}", file=sys.stderr)
        
        # Get available streams
        streams = yt.streams
        print(f"DEBUG: Found {len(streams)} total streams", file=sys.stderr)
        
        # Filter for progressive streams (video + audio)
        progressive_streams = streams.filter(progressive=True)
        print(f"DEBUG: Found {len(progressive_streams)} progressive streams", file=sys.stderr)
        
        # Filter for audio-only streams
        audio_streams = streams.filter(only_audio=True)
        print(f"DEBUG: Found {len(audio_streams)} audio streams", file=sys.stderr)
        
        qualities = {
            'progressive': [],
            'audio': [],
            'title': yt.title,
            'author': yt.author,
            'length': yt.length,
            'views': yt.views
        }
        
        # Add progressive streams
        for stream in progressive_streams:
            quality_info = {
                'itag': stream.itag,
                'resolution': stream.resolution,
                'filesize': stream.filesize,
                'mime_type': stream.mime_type,
                'url': stream.url
            }
            qualities['progressive'].append(quality_info)
            print(f"DEBUG: Progressive stream - {stream.resolution} ({stream.mime_type})", file=sys.stderr)
        
        # Add audio streams
        for stream in audio_streams:
            quality_info = {
                'itag': stream.itag,
                'abr': stream.abr,
                'filesize': stream.filesize,
                'mime_type': stream.mime_type,
                'url': stream.url
            }
            qualities['audio'].append(quality_info)
            print(f"DEBUG: Audio stream - {stream.abr} ({stream.mime_type})", file=sys.stderr)
        
        return qualities
        
    except VideoUnavailable as e:
        print(f"DEBUG: Video unavailable error: {e}", file=sys.stderr)
        return {'error': f'Video unavailable: {str(e)}'}
    except RegexMatchError as e:
        print(f"DEBUG: Regex match error: {e}", file=sys.stderr)
        return {'error': f'Invalid YouTube URL: {str(e)}'}
    except Exception as e:
        print(f"DEBUG: Unexpected error: {e}", file=sys.stderr)
        return {'error': f'Unexpected error: {str(e)}'}

def download_video(url, quality, output_dir=None):
    """Download a YouTube video at specified quality"""
    try:
        print(f"DEBUG: Starting download for URL: {url} with quality: {quality}", file=sys.stderr)
        
        # Use po_token to avoid bot detection
        yt = YouTube(url, use_po_token=True)
        
        print(f"DEBUG: YouTube object created for download", file=sys.stderr)
        
        # Determine output directory
        if not output_dir:
            output_dir = os.getcwd()
        
        print(f"DEBUG: Output directory: {output_dir}", file=sys.stderr)
        
        # Handle different quality requests
        if quality.lower() == 'highest':
            # Get highest quality progressive stream
            stream = yt.streams.get_highest_resolution()
            print(f"DEBUG: Selected highest resolution: {stream.resolution}", file=sys.stderr)
        elif quality.lower() == 'lowest':
            # Get lowest quality progressive stream
            stream = yt.streams.get_lowest_resolution()
            print(f"DEBUG: Selected lowest resolution: {stream.resolution}", file=sys.stderr)
        elif quality.lower() == 'audio':
            # Get best audio stream
            stream = yt.streams.get_audio_only()
            print(f"DEBUG: Selected audio stream: {stream.abr}", file=sys.stderr)
        else:
            # Try to find exact quality match
            print(f"DEBUG: Looking for exact quality match: {quality}", file=sys.stderr)
            
            # First try progressive streams
            stream = yt.streams.filter(progressive=True, resolution=quality).first()
            if not stream:
                # Try without progressive filter
                stream = yt.streams.filter(resolution=quality).first()
            
            if not stream:
                # Try to find closest quality
                print(f"DEBUG: Exact match not found, looking for closest quality", file=sys.stderr)
                available_resolutions = [s.resolution for s in yt.streams.filter(progressive=True) if s.resolution]
                if available_resolutions:
                    # Find closest resolution
                    target_height = int(quality.replace('p', ''))
                    closest = min(available_resolutions, key=lambda x: abs(int(x.replace('p', '')) - target_height))
                    stream = yt.streams.filter(progressive=True, resolution=closest).first()
                    print(f"DEBUG: Using closest available quality: {closest}", file=sys.stderr)
        
        if not stream:
            return {'error': f'No stream found for quality: {quality}'}
        
        print(f"DEBUG: Selected stream - Resolution: {getattr(stream, 'resolution', 'N/A')}, "
              f"ABR: {getattr(stream, 'abr', 'N/A')}, MIME: {stream.mime_type}", file=sys.stderr)
        
        # Download the video
        print(f"DEBUG: Starting download...", file=sys.stderr)
        file_path = stream.download(output_path=output_dir)
        print(f"DEBUG: Download completed: {file_path}", file=sys.stderr)
        
        # Get file info
        file_size = os.path.getsize(file_path)
        file_name = os.path.basename(file_path)
        
        return {
            'success': True,
            'file_path': file_path,
            'file_name': file_name,
            'file_size': file_size,
            'quality': getattr(stream, 'resolution', 'N/A'),
            'audio_bitrate': getattr(stream, 'abr', 'N/A'),
            'mime_type': stream.mime_type
        }
        
    except VideoUnavailable as e:
        print(f"DEBUG: Video unavailable error during download: {e}", file=sys.stderr)
        return {'error': f'Video unavailable: {str(e)}'}
    except RegexMatchError as e:
        print(f"DEBUG: Regex match error during download: {e}", file=sys.stderr)
        return {'error': f'Invalid YouTube URL: {str(e)}'}
    except Exception as e:
        print(f"DEBUG: Unexpected error during download: {e}", file=sys.stderr)
        return {'error': f'Unexpected error: {str(e)}'}

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
