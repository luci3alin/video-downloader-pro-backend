// Video Downloader Pro - Main JavaScript File

class VideoDownloader {
        constructor() {
        this.initializeEventListeners();
        this.currentUrl = '';
        this.downloadProgress = 0;

        // Check if cookies permission was already granted
        this.cookiesPermissionGranted = localStorage.getItem('cookiesPermission') === 'granted';

        // Initialize platform attributes after DOM is loaded
        setTimeout(() => {
            this.initializePlatformAttributes();
        }, 100);
        
        // Initialize cookies buttons
        this.initializeCookiesButtons();

        // Show cookies section if permission not granted OR if cookies are missing
        if (!this.cookiesPermissionGranted || !localStorage.getItem('youtubeCookies')) {
            console.log('🔍 Cookies permission not granted or missing, will show section');
            setTimeout(() => {
                this.showCookiesSection();
            }, 1000); // Show after 1 second
        } else {
            console.log('🔍 Cookies permission already granted');
        }
    }

    initializeEventListeners() {
        const form = document.getElementById('downloadForm');
        const urlInput = document.getElementById('videoUrl');
        
        if (!form || !urlInput) {
            return;
        }

        // Use arrow functions to preserve 'this' context
        form.addEventListener('submit', (e) => {
            this.handleFormSubmit(e);
        });
        
        urlInput.addEventListener('input', (e) => {
            this.handleUrlInput(e);
        });
        
        urlInput.addEventListener('paste', (e) => {
            this.handlePaste(e);
        });
        
        // Initialize theme switcher
        this.initializeThemeSwitcher();
        
        // Initialize legal notice popup
        this.initializeLegalNoticePopup();
    }
    
    initializeThemeSwitcher() {
        const themeButtons = document.querySelectorAll('.theme-btn');
        
        themeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                this.changeTheme(theme);
                
                // Update active button
                themeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // Load saved theme from localStorage
        const savedTheme = localStorage.getItem('selectedTheme') || 'default';
        this.changeTheme(savedTheme);
        
        // Update active button
        themeButtons.forEach(btn => {
            if (btn.dataset.theme === savedTheme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    changeTheme(theme) {
        // Remove all theme attributes
        document.documentElement.removeAttribute('data-theme');
        
        // Apply selected theme
        if (theme !== 'default') {
            document.documentElement.setAttribute('data-theme', theme);
        }
        
        // Save to localStorage
        localStorage.setItem('selectedTheme', theme);
        
        // Add theme change animation
        document.body.style.opacity = '0.8';
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 150);
    }
    
    initializeLegalNoticePopup() {
        const legalNoticeLink = document.getElementById('legalNoticeLink');
        const legalNoticePopup = document.getElementById('legalNoticePopup');
        const closeLegalPopup = document.getElementById('closeLegalPopup');
        
        if (legalNoticeLink && legalNoticePopup && closeLegalPopup) {
            // Open popup
            legalNoticeLink.addEventListener('click', (e) => {
                e.preventDefault();
                legalNoticePopup.style.display = 'flex';
                document.body.style.overflow = 'hidden'; // Prevent background scroll
            });
            
            // Close popup on close button
            closeLegalPopup.addEventListener('click', () => {
                legalNoticePopup.style.display = 'none';
                document.body.style.overflow = 'auto'; // Restore scroll
            });
            
            // Close popup on overlay click
            legalNoticePopup.addEventListener('click', (e) => {
                if (e.target === legalNoticePopup) {
                    legalNoticePopup.style.display = 'none';
                    document.body.style.overflow = 'auto'; // Restore scroll
                }
            });
            
            // Close popup on ESC key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && legalNoticePopup.style.display === 'flex') {
                    legalNoticePopup.style.display = 'none';
                    document.body.style.overflow = 'auto'; // Restore scroll
                }
            });
        }
    }

    handleUrlInput(e) {
        const url = e.target.value.trim();
        this.currentUrl = url;
        
        // Auto-detect platform and show visual feedback
        if (url) {
            this.detectPlatform(url);
        }
    }

    handlePaste(e) {
        // Handle paste events
        setTimeout(() => {
            const url = e.target.value.trim();
            if (url) {
                this.detectPlatform(url);
            }
        }, 100);
    }

    detectPlatform(url) {
        // Convert URL to lowercase for case-insensitive detection
        const urlLower = url.toLowerCase();
        
        const platforms = {
            'youtube.com': (urlLower.includes('playlist?list=') || urlLower.includes('&list=')) ? 'YouTube Playlists' : 'YouTube',
            'youtu.be': 'YouTube',
            'twitter.com': 'Twitter/X',
            'x.com': 'Twitter/X',
            'instagram.com': 'Instagram',
            'tiktok.com': 'TikTok',
            'vimeo.com': 'Vimeo'
        };

        // Special handling for PornHub - add it dynamically if detected
        if (urlLower.includes('pornhub.com')) {
            this.addPornHubPlatform();
            this.highlightPlatform('PornHub');
            return 'PornHub';
        }

        let detectedPlatform = null;
        for (const [domain, platform] of Object.entries(platforms)) {
            if (urlLower.includes(domain)) {
                detectedPlatform = platform;
                break;
            }
        }

        // Visual feedback for platform detection
        this.highlightPlatform(detectedPlatform);
    }

    addPornHubPlatform() {
        // Check if PornHub platform already exists
        const existingPornHub = document.querySelector('.platform[data-platform="pornhub"]');
        if (existingPornHub) {
            return; // Already exists
        }

        // Find the platforms container
        const platformsContainer = document.querySelector('.platforms');
        if (!platformsContainer) {
            return;
        }

        // Create PornHub platform element
        const pornhubPlatform = document.createElement('span');
        pornhubPlatform.className = 'platform';
        pornhubPlatform.setAttribute('data-platform', 'pornhub');
        pornhubPlatform.innerHTML = '<i class="fas fa-video"></i> PornHub';
        
        // Add it after YouTube Playlists (second position)
        const youtubePlaylists = platformsContainer.querySelector('.platform:nth-child(2)');
        if (youtubePlaylists) {
            youtubePlaylists.after(pornhubPlatform);
        } else {
            // Fallback: add at the beginning
            platformsContainer.insertBefore(pornhubPlatform, platformsContainer.firstChild);
        }

        // Add hover effects
        pornhubPlatform.addEventListener('mouseenter', () => {
            pornhubPlatform.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        pornhubPlatform.addEventListener('mouseleave', () => {
            pornhubPlatform.style.transform = 'translateY(0) scale(1)';
        });
    }

    initializePlatformAttributes() {
        // Add data-platform attributes to existing platforms
        const platformsContainer = document.querySelector('.platforms');
        if (!platformsContainer) return;

        const platforms = platformsContainer.querySelectorAll('.platform');
        platforms.forEach((platform, index) => {
            const text = platform.textContent.toLowerCase();
            if (text.includes('youtube') && text.includes('playlist')) {
                platform.setAttribute('data-platform', 'youtube-playlists');
            } else if (text.includes('youtube')) {
                platform.setAttribute('data-platform', 'youtube');
            } else if (text.includes('twitter') || text.includes('x')) {
                platform.setAttribute('data-platform', 'twitter');
            } else if (text.includes('instagram')) {
                platform.setAttribute('data-platform', 'instagram');
            } else if (text.includes('tiktok')) {
                platform.setAttribute('data-platform', 'tiktok');
            } else if (text.includes('vimeo')) {
                platform.setAttribute('data-platform', 'vimeo');
            }
        });
    }

    highlightPlatform(platform) {
        const platformElements = document.querySelectorAll('.platform');
        platformElements.forEach(el => {
            el.style.opacity = '0.5';
            el.style.transform = 'scale(0.95)';
        });

        if (platform) {
            const targetPlatform = Array.from(platformElements).find(el => 
                el.textContent.includes(platform)
            );
            if (targetPlatform) {
                targetPlatform.style.opacity = '1';
                targetPlatform.style.transform = 'scale(1.05)';
                targetPlatform.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
            }
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const url = this.currentUrl.trim();
        if (!url) {
            this.showError('Please enter a valid video URL');
            return;
        }

        if (!this.isValidUrl(url)) {
            this.showError('Please enter a valid URL');
            return;
        }

        // Show progress section
        this.showProgress();
        
        try {
            // Simulate video analysis (in a real app, this would call your backend API)
            await this.analyzeVideo(url);
            
            // Show results
            this.showResults(url);
            
        } catch (error) {
            console.error('=== FORM SUBMIT ERROR ===');
            console.error('Error:', error);
            this.showError('Failed to analyze video. Please check the URL and try again.');
        }
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    async analyzeVideo(url) {
        try {
            // Call real backend API
            const response = await fetch('/api/video-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url })
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                // 🔍 FRONTEND DEBUG - Analysis Info
                console.group('🔍 VIDEO ANALYSIS DEBUG');
                console.log('📊 Method used:', data.debugInfo?.method || 'Unknown');
                console.log('⚡ Is static qualities:', data.debugInfo?.isStatic || false);
                console.log('🎯 Available qualities:', data.qualities);
                if (data.debugInfo?.realQualities) {
                    console.log('🔍 Real detected qualities:', data.debugInfo.realQualities);
                }
                if (data.debugInfo?.totalFormats) {
                    console.log('📋 Total formats found:', data.debugInfo.totalFormats);
                }
                console.log('💬 Message:', data.debugInfo?.message || 'No debug message');
                console.log('📝 Note:', data.note);
                console.groupEnd();
                
                this.videoData = data; // Store for download
            } else {
                // Simple error handling
                if (data.error) {
                    throw new Error(data.error);
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }
        } catch (error) {
            throw new Error(`Analysis failed: ${error.message}`);
        }
    }

    async retryWithDelay(url, delayMs = 5000) {
        console.log(`Retrying in ${delayMs/1000} seconds...`);
        
        // Show retry message
        const progressSection = document.getElementById('progressSection');
        const progressText = document.getElementById('progressText');
        
        if (progressSection && progressText) {
            progressText.textContent = `YouTube blocked the request. Retrying in ${delayMs/1000} seconds...`;
        }
        
        // Wait for delay
        await new Promise(resolve => setTimeout(resolve, delayMs));
        
        // Try again
        return this.analyzeVideo(url);
    }

    updateProgress(percentage) {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        progressBar.style.width = `${percentage}%`;
        
        if (percentage < 50) {
            progressText.textContent = 'Analyzing video...';
        } else if (percentage < 100) {
            progressText.textContent = 'Preparing download options...';
        } else {
            progressText.textContent = 'Analysis complete!';
        }
    }

    showProgress() {
        this.hideAllSections();
        document.getElementById('progressSection').style.display = 'block';
    }

    showResults(url) {
        this.hideAllSections();
        
        // Store the current URL for download operations
        this.currentUrl = url;
        
        const resultsSection = document.getElementById('resultsSection');
        const videoInfo = document.getElementById('videoInfo');
        const downloadOptions = document.getElementById('downloadOptions');
        
        // Use real video data if available
        const data = this.videoData || {};
        const title = data.title || 'Video Detected';
        const thumbnail = data.thumbnail || '';
        const qualities = data.qualities || ['720p', '480p'];
        const formats = data.formats || ['mp4'];
        const note = data.note || '';
        const qualitySizes = data.qualitySizes || {};
        const platform = data.platform || '';
        const videoCount = data.videoCount || 0;
        const videos = data.videos || [];
        
        // Populate video info with thumbnail
        if (platform === 'youtube-playlist') {
            // Show playlist info with Download All button and video list
            let videoListHTML = '';
            let videoCountText = '';
            
            if (videos && videos.length > 0) {
                videoCountText = `${videos.length} video${videos.length !== 1 ? 's' : ''}`;
                
                videoListHTML = `
                    <div style="margin-top: 15px; max-height: 400px; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 10px;">
                        <h4 style="margin-bottom: 10px; color: #2c3e50; font-size: 1rem;">Videos in playlist:</h4>
                        ${videos.map((video, index) => `
                            <div style="display: flex; align-items: center; gap: 10px; padding: 8px; border-bottom: 1px solid #f0e0e0; ${index === videos.length - 1 ? 'border-bottom: none;' : ''}">
                                <span style="color: #ff0000; font-weight: bold;">${index + 1}.</span>
                                <span style="color: #666; font-size: 0.9rem; flex: 1;">
                                    ${video.title}
                                    ${video.duration && video.duration > 0 ? 
                                        `<span style="color: #999; font-size: 0.8rem; margin-left: 10px;">| durata: ${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}</span>` 
                                        : ''
                                    }
                                </span>
                                <button onclick="videoDownloader.downloadSingleVideo('${video.url}', '${video.title}')" 
                                        style="background: #ff0000; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                                    <i class="fas fa-download"></i> Download
                                </button>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                videoCountText = '0 videos';
            }
            
            videoInfo.innerHTML = `
                <div style="display: flex; align-items: flex-start; gap: 20px;">
                    <div style="flex-shrink: 0;">
                        <div style="width: 200px; height: 150px; background: linear-gradient(45deg, #ff0000, #cc0000); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-music" style="color: white; font-size: 3rem;"></i>
                        </div>
                    </div>
                    <div style="flex: 1;">
                        <h3 style="margin-bottom: 12px; color: #2c3e50; font-size: 1.4rem;">${title}</h3>
                        <p style="color: #666; word-break: break-all; margin-bottom: 8px;"><strong>URL:</strong> ${url}</p>
                        <p style="color: #28a745; margin-bottom: 8px;"><i class="fas fa-list"></i> <strong>Playlist:</strong> ${videoCountText}</p>
                        <p style="color: #28a745; margin-bottom: 8px;"><i class="fas fa-check-circle"></i> <strong>Status:</strong> Ready for download</p>
                        ${videoListHTML}
                        <div style="margin-top: 15px;">
                                                         <button onclick="videoDownloader.downloadAllPlaylist('${url}')" style="
                                 background: linear-gradient(45deg, #ff0000, #cc0000);
                                 color: white;
                                 border: none;
                                 padding: 12px 25px;
                                 border-radius: 10px;
                                 font-size: 1rem;
                                 font-weight: 600;
                                 cursor: pointer;
                                 transition: all 0.3s ease;
                                 display: flex;
                                 align-items: center;
                                 gap: 8px;
                             ">
                                 <i class="fas fa-download"></i> Download All as ZIP (MP3s)
                             </button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Show single video info with platform-specific styling
            let platformIcon = 'fas fa-video';
            let platformGradient = 'linear-gradient(45deg, #667eea, #764ba2)';
            let platformBorder = '#667eea';
            
            // Platform-specific styling
            if (platform === 'twitter') {
                platformIcon = 'fab fa-twitter';
                platformGradient = 'linear-gradient(45deg, #1da1f2, #0d8bd9)';
                platformBorder = '#1da1f2';
            } else if (platform === 'instagram') {
                platformIcon = 'fab fa-instagram';
                platformGradient = 'linear-gradient(45deg, #e4405f, #c13584)';
                platformBorder = '#e4405f';
            } else if (platform === 'tiktok') {
                platformIcon = 'fab fa-tiktok';
                platformGradient = 'linear-gradient(45deg, #000000, #25f4ee)';
                platformBorder = '#000000';
            } else if (platform === 'vimeo') {
                platformIcon = 'fab fa-vimeo-v';
                platformGradient = 'linear-gradient(45deg, #1ab7ea, #0d8bd9)';
                platformBorder = '#1ab7ea';
            } else if (platform === 'pornhub') {
                platformIcon = 'fas fa-play-circle';
                platformGradient = 'linear-gradient(45deg, #ff6600, #cc5500)';
                platformBorder = '#ff6600';
            }
            
            videoInfo.innerHTML = `
                <div style="display: flex; align-items: flex-start; gap: 20px;">
                    <div style="flex-shrink: 0;">
                        ${thumbnail ? `
                            <img src="${thumbnail}" alt="Video thumbnail" 
                                 style="width: 200px; height: 150px; object-fit: cover; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); border: 2px solid ${platformBorder};">
                        ` : `
                            <div style="width: 200px; height: 150px; background: ${platformGradient}; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                <i class="${platformIcon}" style="color: white; font-size: 3rem;"></i>
                            </div>
                        `}
                    </div>
                    <div style="flex: 1;">
                        <h3 style="margin-bottom: 12px; color: #2c3e50; font-size: 1.4rem;">${title}</h3>
                        <p style="color: #666; word-break: break-all; margin-bottom: 8px;"><strong>URL:</strong> ${url}</p>
                        <p style="color: #28a745; margin-bottom: 8px;"><i class="fas fa-globe"></i> <strong>Platform:</strong> ${platform}</p>
                        ${note ? `<p style="color: #28a745; margin-bottom: 8px;"><i class="fas fa-info-circle"></i> <strong>Info:</strong> ${note}</p>` : ''}
                        <p style="color: #28a745;"><i class="fas fa-check-circle"></i> <strong>Status:</strong> Ready for download</p>
                    </div>
                </div>
            `;
        }
        
        // Generate format selection buttons - different for playlists and platforms
        if (platform === 'youtube-playlist') {
            // For playlists, show MP4/MP3 toggle buttons
            downloadOptions.innerHTML = `
                <div class="format-selection">
                    <h4 style="margin-bottom: 20px; color: #2c3e50;">Choose Download Format:</h4>
                    <div class="format-buttons" style="display: flex; gap: 15px; justify-content: center;">
                        <button onclick="videoDownloader.setPlaylistFormat('mp4')" class="format-btn" data-format="mp4" style="background: #666; color: white; border: none; padding: 12px 25px; border-radius: 10px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                            <i class="fas fa-video"></i> MP4 (Video)
                        </button>
                        <button onclick="videoDownloader.setPlaylistFormat('mp3')" class="format-btn active" data-format="mp3" style="background: linear-gradient(45deg, #ff0000, #cc0000); color: white; border: none; padding: 12px 25px; border-radius: 10px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                            <i class="fas fa-music"></i> MP3 (Audio)
                        </button>
                    </div>
                    <div style="margin-top: 20px; text-align: center;">
                        <p style="color: #666; font-size: 0.9rem;">Selected format: <strong id="selectedFormat">MP3</strong></p>
                    </div>
                </div>
            `;
            
            // Store current format for playlist - MP3 as default
            this.currentPlaylistFormat = 'mp3';
        } else if (platform === 'twitter' || platform === 'instagram' || platform === 'tiktok' || platform === 'vimeo') {
            // For social media platforms, show format selection like YouTube but with platform-specific styling
            let formatButtonsHTML = '';
            formats.forEach(format => {
                const formatName = format.toUpperCase();
                const formatIcon = format === 'mp3' ? 'fas fa-music' : 'fas fa-video';
                formatButtonsHTML += `
                    <button onclick="videoDownloader.showFormatOptions('${format}')" class="format-btn" data-format="${format}">
                        <i class="${formatIcon}"></i> ${formatName}
                    </button>
                `;
            });
            
            downloadOptions.innerHTML = `
                <div class="format-selection">
                    <h4 style="margin-bottom: 20px; color: #2c3e50;">Choose Format:</h4>
                    <div class="format-buttons">
                        ${formatButtonsHTML}
                    </div>
                </div>
                <div id="formatOptions" class="format-options" style="display: none;">
                    <!-- Format options will be loaded here -->
                </div>
            `;
        } else {
            // For single videos (YouTube, PornHub), show normal format selection
            let formatButtonsHTML = '';
            formats.forEach(format => {
                const formatName = format.toUpperCase();
                const formatIcon = format === 'mp3' ? 'fas fa-music' : 'fas fa-video';
                formatButtonsHTML += `
                    <button onclick="videoDownloader.showFormatOptions('${format}')" class="format-btn" data-format="${format}">
                        <i class="${formatIcon}"></i> ${formatName}
                    </button>
                `;
            });
            
            downloadOptions.innerHTML = `
                <div class="format-selection">
                    <h4 style="margin-bottom: 20px; color: #2c3e50;">Choose Format:</h4>
                    <div class="format-buttons">
                        ${formatButtonsHTML}
                    </div>
                </div>
                <div id="formatOptions" class="format-options" style="display: none;">
                    <!-- Format options will be loaded here -->
                </div>
            `;
        }
        
        // Show results section
        resultsSection.style.display = 'block';
        resultsSection.classList.add('success');
        
        // Show first format by default (only for single videos, not playlists)
        if (formats.length > 0 && platform !== 'youtube-playlist') {
            this.showFormatOptions(formats[0]);
        }
    }

    showFormatOptions(selectedFormat) {
        const formatOptions = document.getElementById('formatOptions');
        const formatButtons = document.querySelectorAll('.format-btn');
        const data = this.videoData || {};
        const qualities = data.qualities || [];
        const qualitySizes = data.qualitySizes || {};
        
        // Update active format button
        formatButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.format === selectedFormat) {
                btn.classList.add('active');
            }
        });
        
        // Generate options for selected format
        let optionsHTML = '';
        
        if (selectedFormat === 'mp3') {
            // MP3 audio option
            optionsHTML = `
                <div class="horizontal-download-options" style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center;">
                    <div class="download-option" style="flex: 0 0 auto; min-width: 280px; max-width: 320px;">
                        <div class="download-option-header">
                            <h4>Audio Only</h4>
                            <span class="format-badge">MP3</span>
                        </div>
                        <p>MP3 • ~5MB • Audio track</p>
                        <button onclick="videoDownloader.downloadVideo('highestaudio', 'mp3')" class="download-btn-option">
                            <i class="fas fa-music"></i> Download MP3
                        </button>
                    </div>
                </div>
            `;
        } else {
            // Video format options (MP4, WEBM) - Horizontal layout with inline styles
            const platform = data.platform || '';
            
            // For social media platforms, show specific quality options
            
            // Normalize platform to lowercase for comparison
            const normalizedPlatform = platform.toLowerCase();
            
            if (normalizedPlatform === 'tiktok' || normalizedPlatform === 'instagram' || normalizedPlatform.includes('twitter') || normalizedPlatform === 'vimeo') {
                let buttonGradient = 'linear-gradient(45deg, #667eea, #764ba2)';
                let buttonIcon = 'fas fa-download';
                let platformName = platform;
                
                if (normalizedPlatform.includes('twitter')) {
                    buttonGradient = 'linear-gradient(45deg, #1da1f2, #0d8bd9)';
                    buttonIcon = 'fab fa-twitter';
                    platformName = 'Twitter/X';
                } else if (normalizedPlatform === 'instagram') {
                    buttonGradient = 'linear-gradient(45deg, #e4405f, #c13584)';
                    buttonIcon = 'fab fa-instagram';
                    platformName = 'Instagram';
                } else if (normalizedPlatform === 'tiktok') {
                    buttonGradient = 'linear-gradient(45deg, #000000, #25f4ee)';
                    buttonIcon = 'fab fa-tiktok';
                    platformName = 'TikTok';
                    
                    // Check if we have no-watermark option
                    const hasNoWatermark = data.hasNoWatermark || false;
                } else if (normalizedPlatform === 'vimeo') {
                    buttonGradient = 'linear-gradient(45deg, #1ab7ea, #0d8bd9)';
                    buttonIcon = 'fab fa-vimeo-v';
                    platformName = 'Vimeo';
                }
                
                // For TikTok, show both watermark and no-watermark options if available
                if (normalizedPlatform === 'tiktok' && data.hasNoWatermark) {
                    optionsHTML = `
                        <div class="horizontal-download-options" style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center;">
                            <div class="download-option" style="flex: 0 0 auto; min-width: 280px; max-width: 320px;">
                                <div class="download-option-header">
                                    <h4>With Watermark</h4>
                                    <span class="format-badge">${selectedFormat.toUpperCase()}</span>
                                </div>
                                <p>${selectedFormat.toUpperCase()} • Original Quality • With TikTok Logo</p>
                                <button onclick="videoDownloader.downloadVideo('Best', '${selectedFormat}')" class="download-btn-option" style="background: ${buttonGradient}; color: white; border: none; padding: 15px 30px; border-radius: 10px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); width: 100%; justify-content: center;">
                                    <i class="${buttonIcon}"></i> Download With Watermark
                                </button>
                            </div>
                            <div class="download-option" style="flex: 0 0 auto; min-width: 280px; max-width: 320px;">
                                <div class="download-option-header">
                                    <h4>No Watermark</h4>
                                    <span class="format-badge">${selectedFormat.toUpperCase()}</span>
                                </div>
                                <p>${selectedFormat.toUpperCase()} • HD Quality • Clean Video</p>
                                <button onclick="videoDownloader.downloadVideo('NoWatermark', '${selectedFormat}')" class="download-btn-option" style="background: linear-gradient(45deg, #25f4ee, #000000); color: white; border: none; padding: 15px 30px; border-radius: 10px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); width: 100%; justify-content: center;">
                                    <i class="fas fa-star"></i> Download No Watermark
                                </button>
                            </div>
                        </div>
                    `;
                } else {
                    // Default option for other platforms or TikTok without no-watermark
                    optionsHTML = `
                        <div class="horizontal-download-options" style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center;">
                            <div class="download-option" style="flex: 0 0 auto; min-width: 280px; max-width: 320px;">
                                <div class="download-option-header">
                                    <h4>Best Quality</h4>
                                    <span class="format-badge">${selectedFormat.toUpperCase()}</span>
                                </div>
                                <p>${selectedFormat.toUpperCase()} • Best Available • ${platformName}</p>
                                <button onclick="videoDownloader.downloadVideo('Best', '${selectedFormat}')" class="download-btn-option" style="background: ${buttonGradient}; color: white; border: none; padding: 15px 30px; border-radius: 10px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); width: 100%; justify-content: center;">
                                    <i class="${buttonIcon}"></i> Download ${platformName} Video
                                </button>
                            </div>
                        </div>
                    `;
                }
            } else {
                // YouTube/PornHub - show multiple quality options
                optionsHTML = '<div class="horizontal-download-options" style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center;">';
                qualities.forEach(quality => {
                    const fileSize = qualitySizes[quality] || this.estimateFileSize(quality);
                    
                    optionsHTML += `
                        <div class="download-option" style="flex: 0 0 auto; min-width: 280px; max-width: 320px;">
                            <div class="download-option-header">
                                <h4>${quality} Quality</h4>
                                <span class="format-badge">${selectedFormat.toUpperCase()}</span>
                            </div>
                            <p>${selectedFormat.toUpperCase()} • ${fileSize} • ${quality}</p>
                            <button onclick="videoDownloader.downloadVideo('${quality}', '${selectedFormat}')" class="download-btn-option">
                                <i class="fas fa-download"></i> Download ${quality}
                            </button>
                        </div>
                    `;
                });
                optionsHTML += '</div>';
            }
        }
        

        formatOptions.innerHTML = optionsHTML;
        formatOptions.style.display = 'block';
    }

    updateActiveFormatButton(selectedFormat) {
        const formatButtons = document.querySelectorAll('.format-btn');
        formatButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.format === selectedFormat) {
                btn.classList.add('active');
            }
        });
    }
    
    setPlaylistFormat(format) {
        this.currentPlaylistFormat = format;
        
        // Update button styles
        const mp4Btn = document.querySelector('.format-btn[data-format="mp4"]');
        const mp3Btn = document.querySelector('.format-btn[data-format="mp3"]');
        const selectedFormatText = document.getElementById('selectedFormat');
        
        if (mp4Btn && mp3Btn) {
            if (format === 'mp4') {
                mp4Btn.style.background = 'linear-gradient(45deg, #ff0000, #cc0000)';
                mp3Btn.style.background = '#666';
                selectedFormatText.textContent = 'MP4';
            } else {
                mp4Btn.style.background = '#666';
                mp3Btn.style.background = 'linear-gradient(45deg, #ff0000, #cc0000)';
                selectedFormatText.textContent = 'MP3';
            }
        }
        
        // Update download buttons in playlist
        this.updatePlaylistDownloadButtons(format);
    }
    
    updatePlaylistDownloadButtons(format) {
        const downloadButtons = document.querySelectorAll('[onclick*="downloadSingleVideo"]');
        const downloadAllButton = document.querySelector('[onclick*="downloadAllPlaylist"]');
        
        downloadButtons.forEach(btn => {
            if (format === 'mp4') {
                btn.innerHTML = '<i class="fas fa-download"></i> Download Video';
                btn.style.background = '#ff0000';
            } else {
                btn.innerHTML = '<i class="fas fa-download"></i> Download Audio';
                btn.style.background = '#28a745';
            }
        });
        
        if (downloadAllButton) {
            if (format === 'mp4') {
                downloadAllButton.innerHTML = '<i class="fas fa-download"></i> Download All as ZIP (Videos)';
            } else {
                downloadAllButton.innerHTML = '<i class="fas fa-download"></i> Download All as ZIP (MP3s)';
            }
        }
    }
    
    async downloadVideo(quality, format) {
        try {
            // 🔍 FRONTEND DEBUG - Download Start
            console.group('📥 VIDEO DOWNLOAD DEBUG');
            console.log('🎯 Requested quality:', quality);
            console.log('📁 Requested format:', format);
            console.log('🔗 Video URL:', this.currentUrl);
            console.log('⏰ Download started at:', new Date().toLocaleTimeString());
            
            // Show progress section but keep video info visible
            this.showDownloadProgress();
            
                                    console.log('🚀 Sending download request to backend...');
                        
                        // Update progress to show connection
                        this.updateDownloadProgress(10, 'Connecting to server...');

                        const response = await fetch('/api/download', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                url: this.currentUrl,
                                quality: quality,
                                format: format
                            })
                        });
                        
                                                // Update progress to show response received
                        this.updateDownloadProgress(20, 'Response received, starting download...');

                        if (!response.ok) {
                            console.error('❌ Backend response error:', response.status);
                            throw new Error(`Download failed: ${response.status}`);
                        }

                        console.log('✅ Backend response received successfully');
                        
                        // Update progress to show download starting
                        this.updateDownloadProgress(30, 'Download starting...');
            
            // 🔍 FRONTEND DEBUG - Download Response
            console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
            console.log('📊 Response status:', response.status);
            console.log('📊 Response type:', response.type);
            
            // 🔍 DOWNLOAD LIBRARY INFO
            const downloadLibrary = response.headers.get('X-Download-Library') || 'unknown';
            const downloadQuality = response.headers.get('X-Download-Quality') || quality;
            const downloadFormat = response.headers.get('X-Download-Format') || format;
            
            console.log('🔍 DOWNLOAD LIBRARY DEBUG:');
            console.log('📚 Library used:', downloadLibrary);
            console.log('🎯 Quality downloaded:', downloadQuality);
            console.log('📁 Format downloaded:', downloadFormat);
            
            // Show download method info to user
            if (downloadLibrary !== 'unknown') {
                console.log(`🎯 Download completed using: ${downloadLibrary}`);
                console.log(`🎯 Quality: ${downloadQuality}, Format: ${downloadFormat}`);
                
                // Update progress message to show which method was used
                this.updateDownloadProgress(50, `Downloading via ${downloadLibrary}...`);
            }
            
            // Create download link with real-time progress tracking
            console.log('💾 Starting blob creation with progress tracking...');
            
            // Track download progress in real-time
            const reader = response.body.getReader();
            const contentLength = response.headers.get('content-length');
            const totalSize = contentLength ? parseInt(contentLength) : 0;
            let downloadedSize = 0;
            const chunks = [];
            
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                chunks.push(value);
                downloadedSize += value.length;
                
                // Calculate progress percentage
                if (totalSize > 0) {
                    const progress = Math.min(95, Math.round((downloadedSize / totalSize) * 100));
                    this.updateDownloadProgress(progress, `Downloading... ${(downloadedSize / (1024 * 1024)).toFixed(2)} MB`);
                } else {
                    // If we don't know total size, estimate progress based on downloaded data
                    const estimatedProgress = Math.min(95, Math.round((downloadedSize / (1024 * 1024)) * 10)); // Rough estimate
                    this.updateDownloadProgress(estimatedProgress, `Downloading... ${(downloadedSize / (1024 * 1024)).toFixed(2)} MB`);
                }
            }
            
            // Create blob from chunks
            const blob = new Blob(chunks);
            console.log('💾 Blob size:', (blob.size / (1024 * 1024)).toFixed(2) + ' MB');
            console.log('💾 Blob type:', blob.type);
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `download_${downloadQuality}.${downloadFormat}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

                                    console.log('✅ Download completed successfully at:', new Date().toLocaleTimeString());
                        console.groupEnd();
                        
                        // Update progress to 100% when download is complete
                        this.updateDownloadProgress(100, 'Download completed successfully!');

                        // Show success message
                        this.showDownloadSuccess(quality);
            
        } catch (error) {
            console.error('❌ Download error:', error);
            console.groupEnd();
            this.showError(`Download failed: ${error.message}`);
        }
    }

    showDownloadProgress() {
        // Hide only the format options, keep video info visible
        const formatOptions = document.getElementById('formatOptions');
        if (formatOptions) {
            formatOptions.style.display = 'none';
        }
        
        // Show progress section
        const progressSection = document.getElementById('progressSection');
        if (progressSection) {
            progressSection.style.display = 'block';
        }
        
        // Update progress text and start at 0%
        const progressText = document.getElementById('progressText');
        const progressBar = document.getElementById('progressBar');
        
        if (progressText && progressBar) {
            // Check if this is a playlist download
            if (this.currentPlaylistFormat) {
                progressText.textContent = 'Connecting to server...';
            } else {
                progressText.textContent = 'Connecting to server...';
            }
            
            // Start at 0% - will be updated during actual download
            progressBar.style.width = '0%';
        }
        
        // Don't simulate progress - wait for actual download to start
        this.currentProgress = 0;
        this.downloadInterval = null;
    }
    
    updateDownloadProgress(progress, message) {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        if (progressBar && progressText) {
            progressBar.style.width = progress + '%';
            progressText.textContent = message || `Downloading... ${Math.round(progress)}%`;
        }
    }

    simulateDownloadProgress() {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        if (!progressBar || !progressText) return;
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                // Check if this is a playlist download
                if (this.currentPlaylistFormat) {
                    progressText.textContent = 'Download complete! Creating ZIP archive...';
                    // Don't hide progress section for playlists - let downloadAllPlaylist handle it
                } else {
                    progressText.textContent = 'Download complete!';
                    
                    // Hide progress section after a short delay only for single videos
                    setTimeout(() => {
                        const progressSection = document.getElementById('progressSection');
                        if (progressSection) {
                            progressSection.style.display = 'none';
                        }
                    }, 1500);
                }
            } else {
                progressText.textContent = `Downloading... ${Math.round(progress)}%`;
            }
            progressBar.style.width = `${progress}%`;
        }, 200);
    }

    estimateFileSize(quality) {
        // More accurate size estimates based on quality
        const sizes = {
            '4K': '~500MB-2GB',
            '1440p': '~200MB-1GB',
            '1080p': '~100MB-500MB',
            '720p': '~50MB-200MB',
            '480p': '~25MB-100MB',
            '360p': '~15MB-50MB',
            '240p': '~10MB-30MB',
            '144p': '~5MB-20MB'
        };
        
        // Try to find exact match first
        if (sizes[quality]) {
            return sizes[quality];
        }
        
        // Try to extract number from quality (e.g., "720p" -> 720)
        const qualityNum = parseInt(quality);
        if (qualityNum) {
            if (qualityNum >= 2160) return sizes['4K'];
            if (qualityNum >= 1440) return sizes['1440p'];
            if (qualityNum >= 1080) return sizes['1080p'];
            if (qualityNum >= 720) return sizes['720p'];
            if (qualityNum >= 480) return sizes['480p'];
            if (qualityNum >= 360) return sizes['360p'];
            if (qualityNum >= 240) return sizes['240p'];
            if (qualityNum >= 144) return sizes['144p'];
        }
        
        return '~20MB'; // Default fallback
    }

    showDownloadSuccess(quality, format) {
        // Hide progress section
        const progressSection = document.getElementById('progressSection');
        if (progressSection) {
            progressSection.style.display = 'none';
        }
        
        // Remove any existing success messages first
        const existingMessages = document.querySelectorAll('.success-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Show success message above the video info
        const videoInfo = document.getElementById('videoInfo');
        if (videoInfo) {
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.style.cssText = `
                background: rgba(76, 175, 80, 0.1);
                border: 1px solid rgba(76, 175, 80, 0.3);
                border-radius: 15px;
                padding: 20px;
                text-align: center;
                margin-bottom: 20px;
                animation: success-bounce 0.6s ease-in-out;
            `;
            
            // Check if this is a playlist download
            const isPlaylist = quality === 'playlist';
            const formatText = isPlaylist ? format.toUpperCase() : format;
            
            successMessage.innerHTML = `
                <div style="font-size: 2rem; color: #4caf50; margin-bottom: 15px;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3 style="color: #2e7d32; margin-bottom: 10px; font-size: 1.4rem;">Download Complete!</h3>
                <p style="color: #2e7d32; margin-bottom: 15px; font-size: 1.1rem;">
                    ${isPlaylist ? `Your ${formatText} playlist has been downloaded successfully as a ZIP file!` : `Your ${quality} quality ${formatText} video has been downloaded successfully.`}
                </p>
                <button onclick="videoDownloader.resetForm()" style="
                    background: linear-gradient(45deg, #4caf50, #45a049);
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 10px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">
                    Download Another Video
                </button>
            `;
            
            // Insert success message before video info
            videoInfo.parentNode.insertBefore(successMessage, videoInfo);
        }
    }

    showSuccess() {
        this.hideAllSections();
        
        const mainContent = document.querySelector('.main-content');
        const successMessage = document.createElement('div');
        successMessage.className = 'success-section';
        successMessage.style.cssText = `
            background: rgba(76, 175, 80, 0.1);
            border: 1px solid rgba(76, 175, 80, 0.3);
            border-radius: 15px;
            padding: 40px;
            text-align: center;
            margin-bottom: 30px;
        `;
        
        successMessage.innerHTML = `
            <div style="font-size: 4rem; color: #4caf50; margin-bottom: 20px;">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3 style="color: #2e7d32; margin-bottom: 15px; font-size: 1.8rem;">Download Complete!</h3>
            <p style="color: #2e7d32; margin-bottom: 25px; font-size: 1.1rem;">
                Your video has been downloaded successfully.
            </p>
            <button onclick="videoDownloader.resetForm()" style="
                background: linear-gradient(45deg, #4caf50, #45a049);
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 10px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            ">
                Download Another Video
            </button>
        `;
        
        mainContent.insertBefore(successMessage, mainContent.firstChild);
    }

    resetForm() {
        document.getElementById('videoUrl').value = '';
        this.currentUrl = '';
        this.videoData = null;
        this.currentPlaylistFormat = null; // Reset playlist format
        
        // Remove any existing success messages
        const existingMessages = document.querySelectorAll('.success-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Reset all sections
        this.hideAllSections();
        
        // Reset form styling
        const formElements = document.querySelectorAll('input, button');
        formElements.forEach(el => {
            el.style.borderColor = '';
            el.style.boxShadow = '';
        });
        
        // Reset platform highlighting
        this.resetPlatformHighlighting();
        
        // Remove PornHub platform if it was added dynamically
        this.removePornHubPlatform();
    }

    showError(message) {
        this.hideAllSections();
        
        const errorSection = document.getElementById('errorSection');
        const errorMessage = document.getElementById('errorMessage');
        
        if (errorMessage) {
            errorMessage.textContent = message;
        }
        
        if (errorSection) {
            errorSection.style.display = 'block';
        } else {
            // Fallback: show alert if error section doesn't exist
            alert(`Error: ${message}`);
        }
    }

    hideError() {
        // Use global function
        const errorSection = document.getElementById('errorSection');
        if (errorSection) {
            errorSection.style.display = 'none';
        }
    }

    hideAllSections() {
        const sections = ['resultsSection', 'progressSection', 'errorSection'];
        sections.forEach(id => {
            document.getElementById(id).style.display = 'none';
        });
    }
    
    resetPlatformHighlighting() {
        const platformElements = document.querySelectorAll('.platform');
        platformElements.forEach(el => {
            // Reset to default state using the same system as highlightPlatform
            el.style.opacity = '1';
            el.style.transform = 'scale(1)';
            el.style.boxShadow = '';
        });
    }
    
    removePornHubPlatform() {
        // Remove PornHub platform by text content (more reliable)
        const platforms = document.querySelectorAll('.platform');
        
        platforms.forEach(platform => {
            const text = platform.textContent.toLowerCase();
            if (text.includes('pornhub')) {
                platform.remove();
            }
        });
        
        // Also try to remove by data-platform attribute as backup
        const pornhubByAttr = document.querySelector('.platform[data-platform="pornhub"]');
        if (pornhubByAttr) {
            pornhubByAttr.remove();
        }
    }
    
    async downloadAllPlaylist(playlistUrl) {
        try {
            console.log('🎵 Starting playlist download for:', playlistUrl);
            
            // Show progress section
            this.showDownloadProgress();
            
            // Update progress text for playlist
            const progressText = document.getElementById('progressText');
            if (progressText) {
                progressText.textContent = 'Preparing playlist download... This may take a while.';
            }
            
            // Update progress bar to show activity
            const progressBar = document.getElementById('progressBar');
            if (progressBar) {
                progressBar.style.width = '10%';
                progressBar.style.backgroundColor = '#2196F3';
            }
            
            // Call backend to download all videos from playlist
            const format = this.currentPlaylistFormat || 'mp3';
            const quality = format === 'mp4' ? '720p' : 'highestaudio';
            
            // Update progress to show download in progress
            if (progressText) {
                progressText.textContent = `Downloading ${format.toUpperCase()} playlist... Please wait...`;
            }
            if (progressBar) {
                progressBar.style.width = '50%';
                progressBar.style.backgroundColor = '#FF9800';
            }
            
            const response = await fetch('/api/download-playlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: playlistUrl,
                    quality: quality,
                    format: format
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Playlist download failed: ${response.status} - ${errorData.error || 'Unknown error'}`);
            }

            // Create download link for the playlist archive
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            
            // Use selected format for filename
            const playlistFormat = this.currentPlaylistFormat || 'mp3';
            a.download = `playlist_${playlistFormat.toUpperCase()}_${Date.now()}.zip`;
            
            // Update progress to show completion
            if (progressText) {
                progressText.textContent = 'Download complete! Processing ZIP file...';
            }
            if (progressBar) {
                progressBar.style.width = '100%';
                progressBar.style.backgroundColor = '#4CAF50';
            }
            
            // Show download success message
            this.showDownloadSuccess('playlist', playlistFormat);
            
            // Trigger download
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            // Hide progress section after successful download
            setTimeout(() => {
                const progressSection = document.getElementById('progressSection');
                if (progressSection) {
                    progressSection.style.display = 'none';
                }
            }, 2000);

            // Show success message
            this.showDownloadSuccess('Playlist');
            
        } catch (error) {
            console.error('Playlist download error:', error);
            this.showError(`Playlist download failed: ${error.message}`);
        }
    }

    async downloadSingleVideo(url, title) {
        try {
            console.log('🎵 Starting single video download for:', title);
            
            // Show progress section
            this.showDownloadProgress();
            
            // Update progress text for single video
            const progressText = document.getElementById('progressText');
            if (progressText) {
                progressText.textContent = `Downloading: ${title}...`;
            }
            
            // Use selected format for playlist downloads
            const format = this.currentPlaylistFormat || 'mp3';
            const quality = format === 'mp4' ? '720p' : 'highestaudio';
            
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: url,
                    quality: quality,
                    format: format
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Video download failed: ${response.status} - ${errorData.error || 'Unknown error'}`);
            }
            
            // Create download link with proper filename
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            
            // Clean title for filename (remove special characters)
            const cleanTitle = title.replace(/[^a-zA-Z0-9\s\-_]/g, '').replace(/\s+/g, '_');
            a.download = `${cleanTitle}.${format}`;
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
            
            // Show success message
            this.showDownloadSuccess('Video');
            
            console.log('✅ Single video download completed:', title);
            
        } catch (error) {
            console.error('Single video download error:', error);
            this.showError(`Download failed: ${error.message}`);
        }
    }
    
    resetForm() {
        document.getElementById('videoUrl').value = '';
        this.currentUrl = '';
        this.videoData = null;
        this.currentPlaylistFormat = null; // Reset playlist format
        
        // Remove any existing success messages
        const existingMessages = document.querySelectorAll('.success-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Reset all sections
        this.hideAllSections();
        
        // Reset form styling
        const formElements = document.querySelectorAll('input, button');
        formElements.forEach(el => {
            el.style.borderColor = '';
            el.style.boxShadow = '';
        });
        
        // Reset platform highlighting
        this.resetPlatformHighlighting();
        
        // Remove PornHub platform if it was added dynamically
        this.removePornHubPlatform();
    }
    
    // Cookies Modal Functions
    showCookiesSection() {
        const section = document.getElementById('cookiesSection');
        if (section) {
            section.style.display = 'block';
            
            // Add event listeners for buttons
            this.initializeCookiesSectionEvents();
            
            // Debug log
            console.log('🔍 Cookies section displayed');
            console.log('🔍 Section element:', section);
        } else {
            console.error('❌ Cookies section not found!');
        }
    }
    
    hideCookiesSection() {
        const section = document.getElementById('cookiesSection');
        if (section) {
            section.style.display = 'none';
        }
    }
    
    initializeCookiesSectionEvents() {
        const saveBtn = document.getElementById('saveCookiesBtn');
        const skipBtn = document.getElementById('skipCookiesBtn');
        
        console.log('🔍 Initializing cookies section events...');
        console.log('🔍 Save button found:', !!saveBtn);
        console.log('🔍 Skip button found:', !!skipBtn);
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                console.log('🔍 Save cookies button clicked');
                this.saveCookiesPermission();
            });
        } else {
            console.error('❌ Save cookies button not found!');
        }
        
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                console.log('🔍 Skip cookies button clicked');
                this.skipCookiesPermission();
            });
        } else {
            console.error('❌ Skip cookies button not found!');
        }
    }
    
    initializeCookiesButtons() {
        const resetBtn = document.getElementById('resetCookiesBtn');
        const acceptBtn = document.getElementById('acceptCookiesBtn');
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetCookies();
            });
        }
        
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                this.acceptCookiesAutomatically();
            });
        }
        
        console.log('🔍 Cookies buttons initialized');
        console.log('🔍 Reset button found:', !!resetBtn);
        console.log('🔍 Accept button found:', !!acceptBtn);
    }
    
    resetCookies() {
        // Clear cookies from localStorage
        localStorage.removeItem('youtubeCookies');
        localStorage.removeItem('cookiesPermission');
        
        // Reset permission flag
        this.cookiesPermissionGranted = false;
        
        // Show cookies section again
        this.showCookiesSection();
        
        console.log('✅ Cookies reset successfully');
        console.log('🔍 Showing cookies section again...');
    }
    
    saveCookiesPermission() {
        // Get cookie values from inputs
        const consentCookie = document.getElementById('consentCookie').value.trim();
        const visitorCookie = document.getElementById('visitorCookie').value.trim();
        const yscCookie = document.getElementById('yscCookie').value.trim();
        
        if (!consentCookie || !visitorCookie || !yscCookie) {
            alert('Please fill in all cookie fields');
            return;
        }
        
        // Save cookies to localStorage
        const cookies = {
            CONSENT: consentCookie,
            VISITOR_INFO1_LIVE: visitorCookie,
            YSC: yscCookie
        };
        
        localStorage.setItem('youtubeCookies', JSON.stringify(cookies));
        localStorage.setItem('cookiesPermission', 'granted');
        this.cookiesPermissionGranted = true;
        
        // Send cookies to server
        this.sendCookiesToServer(cookies);
        
        // Show success message
        this.showCookiesSuccess();
        
        // Hide cookies section
        this.hideCookiesSection();
    }
    
    acceptCookiesAutomatically() {
        console.log('🔍 Accepting cookies automatically...');
        
        // Generate default cookies that work
        const defaultCookies = {
            CONSENT: 'YES+cb.20241231-19-p0.en+FX+425',
            VISITOR_INFO1_LIVE: 'v' + Math.random().toString(36).substring(2, 13),
            YSC: Math.random().toString(36).substring(2, 17)
        };
        
        // Save to localStorage
        localStorage.setItem('youtubeCookies', JSON.stringify(defaultCookies));
        localStorage.setItem('cookiesPermission', 'granted');
        this.cookiesPermissionGranted = true;
        
        // Send to server
        this.sendCookiesToServer(defaultCookies);
        
        // Show success message
        this.showNotification('✅ Cookies accepted automatically! YouTube downloads should work now.', 'success');
        
        console.log('✅ Cookies accepted automatically:', defaultCookies);
        
        // Hide cookies section if it's visible
        this.hideCookiesSection();
    }
    
    async sendCookiesToServer(cookies) {
        try {
            const response = await fetch('/api/update-cookies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cookies })
            });
            
            if (response.ok) {
                console.log('✅ Cookies sent to server successfully');
            } else {
                console.error('❌ Failed to send cookies to server');
            }
        } catch (error) {
            console.error('❌ Error sending cookies to server:', error);
        }
    }
    
    skipCookiesPermission() {
        // Save permission to localStorage
        localStorage.setItem('cookiesPermission', 'skipped');
        
        // Show info message
        this.showCookiesInfo();
        
        // Hide cookies section
        this.hideCookiesSection();
    }
    
    showCookiesSuccess() {
        // Create success notification
        const notification = document.createElement('div');
        notification.className = 'cookies-notification success';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>YouTube cookies saved successfully! Downloads should work better now.</span>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
    
    showCookiesInfo() {
        // Create info notification
        const notification = document.createElement('div');
        notification.className = 'cookies-notification info';
        notification.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>Cookies skipped. YouTube downloads may fail due to bot detection.</span>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
    
    showNotification(message, type = 'info') {
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
}

// Global functions that can be called from HTML
function hideError() {
    document.getElementById('errorSection').style.display = 'none';
}

function showError(message) {
    const errorSection = document.getElementById('errorSection');
    const errorMessage = document.getElementById('errorMessage');
    
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
}

// Clipboard functionality
async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        const urlInput = document.getElementById('videoUrl');
        urlInput.value = text;
        urlInput.focus();
        
        // Trigger input event to detect platform
        const event = new Event('input', { bubbles: true });
        urlInput.dispatchEvent(event);
        
    } catch (err) {
        console.log('Failed to read clipboard contents: ', err);
        // Fallback: show message to user
        alert('Please paste the URL manually (Ctrl+V)');
    }
}

// Initialize the application
let videoDownloader;

document.addEventListener('DOMContentLoaded', () => {
    try {
        videoDownloader = new VideoDownloader();
    } catch (error) {
        console.error('Failed to initialize VideoDownloader:', error);
    }
});

function addInteractiveEffects() {
    // Add hover effects to platform icons
    const platforms = document.querySelectorAll('.platform');
    platforms.forEach(platform => {
        platform.addEventListener('mouseenter', () => {
            platform.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        platform.addEventListener('mouseleave', () => {
            platform.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add loading animation to download button
    const downloadBtn = document.querySelector('.download-btn');
    downloadBtn.addEventListener('click', () => {
        downloadBtn.classList.add('loading');
        setTimeout(() => {
            downloadBtn.classList.remove('loading');
        }, 2000);
    });
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to submit form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('downloadForm').dispatchEvent(new Event('submit'));
    }
    
    // Escape to clear form
    if (e.key === 'Escape') {
        videoDownloader.resetForm();
    }
});

// Add service worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Only register service worker if we're on a proper domain (not file://)
        if (window.location.protocol === 'https:' || window.location.protocol === 'http:') {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('SW registered: ', registration);
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                });
        } else {
            console.log('Service worker not registered: file:// protocol not supported');
        }
    });
}

// Revolut tag copy functionality
function copyRevolutTag() {
    const tagValue = '@luci3alin';
    
    // Try to use modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(tagValue).then(() => {
            showCopySuccess();
        }).catch(err => {
            console.error('Failed to copy: ', err);
            fallbackCopy(tagValue);
        });
    } else {
        // Fallback for older browsers
        fallbackCopy(tagValue);
    }
}

// PayPal email copy functionality
function copyPayPalEmail() {
    const emailValue = 'support@videodownloader.com';
    
    // Try to use modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(emailValue).then(() => {
            showCopyEmailSuccess();
        }).catch(err => {
            console.error('Failed to copy: ', err);
            fallbackCopy(emailValue);
        });
    } else {
        // Fallback for older browsers
        fallbackCopy(emailValue);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopySuccess();
    } catch (err) {
        console.error('Fallback copy failed: ', err);
        alert('Failed to copy tag. Please copy manually: ' + text);
    }
    
    document.body.removeChild(textArea);
}

function showCopySuccess() {
    const copyBtn = document.querySelector('.copy-tag-btn');
    const originalIcon = copyBtn.innerHTML;
    
    // Change icon to checkmark
    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
    copyBtn.style.background = 'rgba(76, 175, 80, 0.8)';
    
    // Reset after 2 seconds
    setTimeout(() => {
        copyBtn.innerHTML = originalIcon;
        copyBtn.style.background = 'rgba(255, 255, 255, 0.3)';
    }, 2000);
}

function showCopyEmailSuccess() {
    const copyBtn = document.querySelector('.copy-email-btn');
    const originalIcon = copyBtn.innerHTML;
    
    // Change icon to checkmark
    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
    copyBtn.style.background = 'rgba(76, 175, 80, 0.8)';
    
    // Reset after 2 seconds
    setTimeout(() => {
        copyBtn.innerHTML = originalIcon;
        copyBtn.style.background = 'rgba(255, 255, 255, 0.3)';
    }, 2000);
}
