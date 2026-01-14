window.VortixWebSocket = (function () {
    return {
        init: function (ctx) {
            const Logger = ctx.Logger;
            const NotificationSystem = ctx.NotificationSystem;
            const state = ctx.state;
            const decoder = ctx.decoder;

            (function fetchOverride() {
                const originalFetch = window.fetch;

                window.fetch = function (url, config) {
                    try {
                        if (state.bypassSuccessful) {
                            return originalFetch(url, config);
                        }

                        const urlStr = (typeof url === 'string') ? url : (url && url.url) ? url.url : '';
                        Logger.info('📡 Fetch request intercepted');
                        Logger.info('🔗 Fetch request url summary: ' + urlStr);

                        if (typeof INCENTIVE_SYNCER_DOMAIN === 'undefined' || typeof INCENTIVE_SERVER_DOMAIN === 'undefined') {
                            Logger.warn('⚠️ Missing non critical global variable');
                            return originalFetch(url, config);
                        }

                        if (urlStr.includes(`${INCENTIVE_SYNCER_DOMAIN}/tc`)) {

                            return originalFetch(url, config).then(response => {
                                Logger.info('📥 Fetch response status code: ' + response.status);
                                Logger.info('📄 Fetch response content type: ' + response.headers.get('content-type'));

                                if (!response.ok) {
                                    Logger.warn('⚠️ Fetch returned non ok status');
                                }
                                return response;

                            }).then(response => {
                                return response.clone().json().then(data => {
                                    let urid = '';
                                    let task_id = '';
                                    let action_pixel_url = '';

                                    try {
                                        data.forEach(item => {
                                            urid = item.urid;
                                            task_id = 54;
                                            action_pixel_url = item.action_pixel_url;
                                        });
                                    } catch (e) {
                                        Logger.warn('⚠️ Unexpected json structure received');
                                    }

                                    try {
                                        if (typeof KEY === 'undefined' || typeof TID === 'undefined') {
                                            Logger.warn('⚠️ Missing non critical global variable');
                                            return response;
                                        }

                                        const wsUrl = `wss://${(urid.substr(-5) % 3)}.${INCENTIVE_SERVER_DOMAIN}/c?uid=${urid}&cat=${task_id}&key=${KEY}`;
                                        Logger.info('🌐 WebSocket url opened: ' + wsUrl);

                                        const ws = new WebSocket(wsUrl);
                                        let wsTimeout;
                                        let heartbeatInterval;

                                        ws.onopen = () => {
                                            Logger.info('🔗 WebSocket connection opened');
                                            ws.send('0');
                                            wsTimeout = setTimeout(() => {
                                                Logger.warn('⏳ WebSocket timeout waiting for result');
                                                clearInterval(heartbeatInterval);
                                                ws.close();
                                            }, 90000);
                                            
                                            heartbeatInterval = setInterval(() => {
                                                if (state.bypassSuccessful) {
                                                    clearInterval(heartbeatInterval);
                                                    ws.close();
                                                    return;
                                                }
                                                Logger.info('💓 WebSocket heartbeat sent');
                                                ws.send('0');
                                            }, 1000);
                                        };

                                        ws.onmessage = event => {
                                            if (state.bypassSuccessful) return;

                                            Logger.info('📩 WebSocket message received preview: ' + event.data.substring(0, 20) + '...');
                                            Logger.info('📏 WebSocket message length: ' + event.data.length);

                                            if (event.data && event.data.includes('r:')) {
                                                const PUBLISHER_LINK = event.data.replace('r:', '');

                                                if (typeof PUBLISHER_LINK !== 'undefined' && PUBLISHER_LINK) {
                                                    try {
                                                        Logger.info('🧬 Decode process started');
                                                        Logger.info('📏 Decode input length: ' + PUBLISHER_LINK.length);
                                                        Logger.info('📏 Decode prefix length: 5');

                                                        const finalUrl = decodeURIComponent(decoder.decodeURIxor(PUBLISHER_LINK));

                                                        Logger.info('✅ Decode completed successfully');
                                                        Logger.info('🔓 Decoded url preview masked: ' + finalUrl.substring(0, 15) + '...');

                                                        clearTimeout(wsTimeout);
                                                        clearInterval(heartbeatInterval);
                                                        ws.close();

                                                        const endTime = Date.now();
                                                        const duration = ((endTime - state.processStartTime) / 1000).toFixed(2);

                                                        Logger.info('⏱️ Total bypass duration: ' + duration + 's');
                                                        state.decodedUrl = finalUrl;
                                                        
                                                        if (window.VortixBypassContext.ui) {
                                                            window.VortixBypassContext.ui.handleBypassSuccess(finalUrl, duration);
                                                        }
                                                    } catch (e) {
                                                        Logger.error('🔥 Critical decode failure');
                                                        NotificationSystem.show('Decode Error', 'Falling back to alternate method', 'warning', 3000);
                                                    }
                                                }
                                            }
                                        };

                                        ws.onerror = (err) => {
                                            Logger.error('☠️ WebSocket fatal error');
                                            clearInterval(heartbeatInterval);
                                        };

                                        ws.onclose = () => {
                                            if (!state.bypassSuccessful) {
                                                Logger.error('📉 WebSocket closed unexpectedly');
                                            } else {
                                                Logger.info('🔚 Observer disconnected cleanly');
                                            }
                                            clearTimeout(wsTimeout);
                                            clearInterval(heartbeatInterval);
                                        };

                                        try {
                                            if (navigator.sendBeacon) {
                                                Logger.info('🧾 Beacon request attempted');
                                                navigator.sendBeacon(`https://${(urid.substr(-5) % 3)}.${INCENTIVE_SERVER_DOMAIN}/st?uid=${urid}&cat=${task_id}`);
                                            }
                                        } catch (e) {
                                            Logger.error('💣 Beacon request failed critically');
                                        }

                                        if (action_pixel_url) {
                                            Logger.info('🖼️ Pixel request attempted');
                                            fetch(action_pixel_url).catch(() => {
                                                Logger.error('💣 Pixel request failed critically');
                                            });
                                        }
                                        fetch(`https://${INCENTIVE_SYNCER_DOMAIN}/td?ac=1&urid=${urid}&&cat=${task_id}&tid=${TID}`).catch(() => { });

                                    } catch (e) {
                                        Logger.error('☠️ WebSocket fatal error');
                                    }

                                    return new Response(JSON.stringify(data), {
                                        status: response.status,
                                        statusText: response.statusText,
                                        headers: response.headers
                                    });
                                }).catch(err => {
                                    Logger.error('💀 Json parsing failed for required data');
                                    return response;
                                });
                            }).catch(err => {
                                Logger.error('📉 Fetch failed completely');
                                return originalFetch(url, config);
                            });
                        }
                    } catch (e) {
                        Logger.error('📉 Fetch failed completely');
                    }

                    return originalFetch(url, config);
                };

            })();

            Logger.info('✅ VortixWebSocket Module Initialized');
        }
    };
})();
