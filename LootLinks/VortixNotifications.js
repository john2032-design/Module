window.VortixNotifications = (function () {
    return {
        init: function (ctx) {
            const Logger = ctx.Logger;
            const NotificationSystem = {
                show: function (title, message, type = 'info', timeout = 3500) {
                    try {
                        Logger.info('🔔 Notification shown to user: ' + title);
                        let container = document.querySelector('.notification-container');
                        if (!container) {
                            container = document.createElement('div');
                            container.className = 'notification-container';
                            document.body.appendChild(container);
                        }

                        const colors = {
                            info: { bg: 'rgba(30, 27, 75, 0.95)', border: '#8b5cf6' },
                            success: { bg: 'rgba(6, 78, 59, 0.95)', border: '#10b981' },
                            warning: { bg: 'rgba(113, 63, 18, 0.95)', border: '#f59c00' },
                            error: { bg: 'rgba(127, 29, 29, 0.95)', border: '#ef4444' }
                        };
                        const c = colors[type] || colors.info;
                        const id = 'bypass-notif-' + Date.now();

                        const html = `
<div id="${id}" class="bypass-notification" style="background:${c.bg}; border:1px solid ${c.border};">
<div style="display:flex;gap:12px;align-items:center;">
<div style="font-weight:700; font-size:15px; min-width: 80px;">${title}</div>
<div style="flex:1;color:rgba(255,255,255,0.9);font-weight:400;text-align:right; font-size:14px;">${message}</div>
</div>
</div>
`;

                        container.insertAdjacentHTML('beforeend', html);
                        const el = document.getElementById(id);

                        requestAnimationFrame(() => {
                            el.style.transform = 'translateX(0)';
                            el.style.opacity = '1';
                        });

                        setTimeout(() => {
                            el.style.transform = 'translateX(120%)';
                            el.style.opacity = '0';
                            setTimeout(() => el.remove(), 400);
                        }, timeout);
                    } catch (e) {
                        Logger.error('❌ Notification system failed', e);
                    }
                }
            };
            window.VortixBypassContext.NotificationSystem = NotificationSystem;
            Logger.info('✅ VortixNotifications Module Initialized');
        }
    };
})();
