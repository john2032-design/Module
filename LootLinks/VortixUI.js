window.VortixUI = (function () {
    return {
        init: function (ctx) {
            const Logger = ctx.Logger;
            const NotificationSystem = ctx.NotificationSystem;
            const state = ctx.state;

            function copyToClipboard(text) {
                Logger.info('📋 Clipboard copy attempt');
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(text).then(() => {
                        Logger.info('✅ Clipboard copy success');
                        NotificationSystem.show('Copied!', 'Link copied to clipboard', 'success', 2000);
                    }).catch(err => {
                        Logger.error('❌ Clipboard copy failed completely');
                        fallbackCopy(text);
                    });
                } else {
                    Logger.info('🧩 Fallback logic used');
                    fallbackCopy(text);
                }
            }

            function fallbackCopy(text) {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    const successful = document.execCommand('copy');
                    if (successful) {
                        Logger.info('✅ Clipboard copy success');
                        NotificationSystem.show('Copied!', 'Link copied to clipboard', 'success', 2000);
                    } else {
                        Logger.error('❌ Clipboard copy failed completely');
                        NotificationSystem.show('Error', 'Failed to copy', 'error', 2000);
                    }
                } catch (err) {
                    Logger.error('❌ Clipboard copy failed completely');
                    NotificationSystem.show('Error', 'Failed to copy', 'error', 2000);
                }
                document.body.removeChild(textArea);
            }

            function handleBypassSuccess(url, time) {
                state.bypassSuccessful = true;
                const overlay = document.getElementById('modern-bypass-overlay');
                if (!overlay) return;

                const ring = overlay.querySelector('.progress-ring');
                if (ring) ring.classList.add('hidden');

                const status = overlay.querySelector('.status-text');
                if (status) status.innerHTML = '🎉 Link Decoded Successfully!';

                const dots = overlay.querySelector('.loading-dots');
                if (dots) dots.style.display = 'none';

                const taskInfo = overlay.querySelector('.task-type');
                if (taskInfo) taskInfo.style.display = 'none';

                const footer = overlay.querySelector('.footer-note');
                if (footer) footer.textContent = 'Your link is ready below';

                let resultDiv = overlay.querySelector('.result-container');
                if (!resultDiv) {
                    resultDiv = document.createElement('div');
                    resultDiv.className = 'result-container';
                    const container = overlay.querySelector('.bypass-container');
                    if (container) container.appendChild(resultDiv);
                }

                resultDiv.innerHTML = `
<div class="result-time">Time Taken: ${time}s</div>
<div class="url-display-box">${url}</div>
<button class="action-btn" id="copy-link-btn">
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
</svg>
Copy Link
</button>
`;
                resultDiv.style.display = 'flex';

                const btn = resultDiv.querySelector('#copy-link-btn');
                if (btn) {
                    btn.onclick = () => copyToClipboard(url);
                }

                state.decodedUrl = url;
                Logger.info('🎉 Bypass completed successfully');
                Logger.info('📊 Summary metrics counts and durations: ' + time + 's total time');
            }

            function updateUI() {
                try {
                    const overlay = document.getElementById('modern-bypass-overlay');
                    if (!overlay) return;

                    const duration = ((Date.now() - state.processStartTime) / 1000).toFixed(2);

                    const status = overlay.querySelector('.status-text');
                    if (status) status.innerHTML = '🎉 Link Decoded Successfully!';

                    const dots = overlay.querySelector('.loading-dots');
                    if (dots) dots.style.display = 'none';

                    const footer = overlay.querySelector('.footer-note');
                    if (footer) footer.textContent = 'Your link is ready below';

                    const ring = overlay.querySelector('.progress-ring');
                    if (ring) ring.classList.add('hidden');

                    const taskInfo = overlay.querySelector('.task-type');
                    if (taskInfo) taskInfo.style.display = 'none';

                    let resultDiv = overlay.querySelector('.result-container');
                    if (!resultDiv) {
                        resultDiv = document.createElement('div');
                        resultDiv.className = 'result-container';
                        const container = overlay.querySelector('.bypass-container');
                        if (container) container.appendChild(resultDiv);
                    }

                    resultDiv.innerHTML = `
<div class="result-time">Time Taken: ${duration}s</div>
<div class="url-display-box">${state.decodedUrl}</div>
<button class="action-btn" id="copy-link-btn">
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
</svg>
Copy Link
</button>
`;
                    resultDiv.style.display = 'flex';

                    const btn = resultDiv.querySelector('#copy-link-btn');
                    if (btn) {
                        btn.onclick = () => copyToClipboard(state.decodedUrl);
                    }
                    Logger.info('🔄 UI state updated');
                } catch (e) {
                    Logger.error('❌ UI overlay failed to render');
                }
            }

            function detectTaskInfo() {
                let countdownSeconds = 60;
                let taskName = 'Processing';
                let taskIcon = '🔓';

                try {
                    const images = document.querySelectorAll('img');
                    for (let img of images) {
                        const src = (img.src || '').toLowerCase();
                        if (src.includes('eye.png')) {
                            countdownSeconds = 13; taskName = 'View Content'; taskIcon = '👁️'; break;
                        } else if (src.includes('bell.png')) {
                            countdownSeconds = 30; taskName = 'Notification'; taskIcon = '🔔'; break;
                        } else if (src.includes('apps.png') || src.includes('fire.png')) {
                            countdownSeconds = 60; taskName = 'App Install'; taskIcon = '⬇️'; break;
                        } else if (src.includes('gamers.png')) {
                            countdownSeconds = 90; taskName = 'Gaming Offer'; taskIcon = '🎮'; break;
                        }
                    }
                    Logger.info('🤖 Heuristic detection used');
                    Logger.info('🎯 Detected task name: ' + taskName);
                    Logger.info('🎨 Detected task icon: ' + taskIcon);
                    Logger.info('⏳ Detected countdown duration: ' + countdownSeconds + 's');
                } catch (e) {
                    Logger.warn('⚠️ Unexpected json structure received');
                }
                return { countdownSeconds, taskName, taskIcon };
            }

            function showBypassUI(targetElement) {
                const parentElement = targetElement.parentElement;
                if (!parentElement) return;

                Logger.info('🔄 Parent element replaced for UI');
                const { countdownSeconds, taskName, taskIcon } = detectTaskInfo();

                state.processStartTime = Date.now();

                parentElement.innerHTML = '';
                
                if(document.getElementById('modern-bypass-overlay')) {
                    document.getElementById('modern-bypass-overlay').remove();
                }

                const popupHTML = `
<div id="modern-bypass-overlay">
<div class="bypass-container" role="dialog" aria-modal="true">
<div class="logo-section">
<div class="logo-icon">
<img src="https://i.ibb.co/cKy9ztXL/IMG-3412.png" alt="logo">
</div>
<div class="logo-text">LootLabs Bypass</div>
</div>
<div class="status-text">Processing your request <span class="loading-dots"><span></span><span></span><span></span></span></div>
<div class="task-type">
<div class="task-icon">${taskIcon}</div>
<div class="task-info">
<h4>${taskName}</h4>
<p>Estimated wait time: ${countdownSeconds} seconds</p>
</div>
</div>
<div class="progress-ring" aria-hidden="true">
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
<stop offset="0%" stop-color="var(--primary)"/>
<stop offset="100%" stop-color="var(--accent)"/>
</linearGradient>
</defs>
<circle class="progress-ring-circle" cx="100" cy="100" r="90"></circle>
<circle class="progress-ring-circle-progress" id="progress-circle" cx="100" cy="100" r="90"></circle>
</svg>
<div class="progress-text" id="countdown-display">${countdownSeconds}</div>
<div class="progress-label">seconds</div>
</div>
<div class="result-container"></div>
<div class="footer-note">Please wait while we process your request</div>
</div>
</div>
`;
                document.documentElement.insertAdjacentHTML('afterbegin', popupHTML);
                Logger.info('✅ UI overlay injected successfully');

                try {
                    const progressCircle = document.getElementById('progress-circle');
                    const countdownDisplay = document.getElementById('countdown-display');
                    const radius = 90;
                    const circumference = 2 * Math.PI * radius;

                    if (progressCircle) progressCircle.style.strokeDasharray = circumference.toString();

                    let remaining = countdownSeconds;
                    const updateInterval = 1000;

                    if (countdownDisplay) countdownDisplay.textContent = remaining;

                    const timer = setInterval(() => {
                        if (state.bypassSuccessful) {
                            clearInterval(timer);
                            return;
                        }

                        remaining--;

                        if (countdownDisplay) countdownDisplay.textContent = remaining > 0 ? remaining : '0';

                        if (progressCircle) {
                            const progress = Math.max(0, Math.min(1, (countdownSeconds - remaining) / countdownSeconds));
                            const offset = circumference - (progress * circumference);
                            progressCircle.style.strokeDashoffset = offset;
                        }

                        if (remaining <= 0) {
                            clearInterval(timer);
                        }
                    }, updateInterval);

                } catch (e) {
                    Logger.error('❌ UI overlay failed to render');
                }
            }

            window.VortixBypassContext.ui = {
                handleBypassSuccess: handleBypassSuccess,
                updateUI: updateUI,
                showBypassUI: showBypassUI
            };

            Logger.info('✅ VortixUI Module Initialized');
        }
    };
})();
