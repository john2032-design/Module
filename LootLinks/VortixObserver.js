window.VortixObserver = (function () {
    return {
        init: function (ctx) {
            const Logger = ctx.Logger;
            const ui = ctx.ui;

            function initUIAndObserver() {
                Logger.info('👀 MutationObserver started');

                const immediateCheck = Array.from(document.querySelectorAll('*')).find(el =>
                    el.textContent && (el.textContent.includes('UNLOCK CONTENT') || el.textContent.includes('Unlock Content'))
                );

                if (immediateCheck) {
                    Logger.info('🔓 Unlock content element found immediately');
                    if (ui && ui.showBypassUI) {
                        ui.showBypassUI(immediateCheck);
                    }
                    return;
                }

                const setupObserver = () => {
                    const observer = new MutationObserver((mutationsList, observerRef) => {
                        for (const mutation of mutationsList) {
                            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                                for (const node of mutation.addedNodes) {
                                    if (node.nodeType === 1) {
                                        if (node.textContent && (node.textContent.includes('UNLOCK CONTENT') || node.textContent.includes('Unlock Content'))) {
                                            Logger.info('🔓 Unlock content element detected');
                                            if (ui && ui.showBypassUI) {
                                                ui.showBypassUI(node);
                                            }
                                            observerRef.disconnect();
                                            Logger.info('🛑 MutationObserver stopped');
                                            return;
                                        }
                                        const foundChild = Array.from(node.querySelectorAll('*')).find(el =>
                                            el.textContent && (el.textContent.includes('UNLOCK CONTENT') || el.textContent.includes('Unlock Content'))
                                        );
                                        if (foundChild) {
                                            Logger.info('🔓 Unlock content element detected');
                                            if (ui && ui.showBypassUI) {
                                                ui.showBypassUI(foundChild);
                                            }
                                            observerRef.disconnect();
                                            Logger.info('🛑 MutationObserver stopped');
                                            return;
                                        }
                                    }
                                }
                            }
                        }
                    });

                    observer.observe(document.body, { childList: true, subtree: true });
                };

                setupObserver();
            }

            initUIAndObserver();
            Logger.info('✅ VortixObserver Module Initialized');
        }
    };
})();
