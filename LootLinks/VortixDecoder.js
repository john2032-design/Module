window.VortixDecoder = (function () {
    return {
        init: function (ctx) {
            function decodeURIxor(encodedString, prefixLength = 5) {
                let decodedString = '';
                const base64Decoded = atob(encodedString);
                const prefix = base64Decoded.substring(0, prefixLength);
                const encodedPortion = base64Decoded.substring(prefixLength);

                for (let i = 0; i < encodedPortion.length; i++) {
                    const encodedChar = encodedPortion.charCodeAt(i);
                    const prefixChar = prefix.charCodeAt(i % prefix.length);
                    const decodedChar = encodedChar ^ prefixChar;
                    decodedString += String.fromCharCode(decodedChar);
                }
                return decodedString;
            }

            window.VortixBypassContext.decoder = {
                decodeURIxor: decodeURIxor
            };

            ctx.Logger.info('✅ VortixDecoder Module Initialized');
        }
    };
})();
