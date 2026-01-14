window.VortixSettings = (function () {
    return {
        init: function (ctx) {
            const Logger = ctx.Logger;
            const NotificationSystem = ctx.NotificationSystem;
            const config = ctx.config;

            function createSettingsButton() {
                if (document.getElementById('vortix-settings')) return;
                const btn = document.createElement('div');
                btn.id = 'vortix-settings';
                btn.innerHTML = '⚙️';
                btn.onclick = () => {
                    const val = prompt('⚙️ Enter redirect wait time (seconds):', config.waitTime);
                    if (val && !isNaN(val)) {
                        config.waitTime = parseInt(val);
                        NotificationSystem.show('Settings', `Wait time updated to ${val}s`, 'success', 2000);
                        Logger.info(`⚙️ Wait time updated to ${val}s`);
                    }
                };
                document.documentElement.appendChild(btn);
            }

            createSettingsButton();
            Logger.info('✅ VortixSettings Module Initialized');
        }
    };
})();
