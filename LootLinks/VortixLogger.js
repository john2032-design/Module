window.VortixLogger = (function () {
    return {
        init: function (ctx) {
            const Logger = {
                info: (m, d = '') => console.info(`[INFO] [VortixBypass] ${m}`, d || ''),
                warn: (m, d = '') => console.warn(`[WARN] [VortixBypass] ${m}`, d || ''),
                error: (m, d = '') => console.error(`[ERROR] [VortixBypass] ${m}`, d || '')
            };
            window.VortixBypassContext.Logger = Logger;
            Logger.info('✅ VortixLogger Module Initialized');
        }
    };
})();
