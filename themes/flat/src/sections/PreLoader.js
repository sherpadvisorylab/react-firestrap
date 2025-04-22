import React, { useEffect, useRef } from "react";

const DEFAULT_DELAY = 0;
const FADE_OUT_TIMING = 1.5;

function PreLoader({ delay = null }) {
    const loaderRef = useRef(null);

    useEffect(() => {
        const elem = loaderRef.current;
        if (!elem) return;
        if(delay === false) return;

        // Definizione della funzione fadeOut
        elem.fadeOut = function (timing) {
            let newValue = 1;
            elem.style.opacity = 1;
            const fadeOutInterval = setInterval(function () {
                if (newValue > 0) {
                    newValue -= 0.01;
                    elem.style.opacity = newValue;
                } else {
                    elem.style.opacity = 0;
                    elem.style.display = 'none';
                    clearInterval(fadeOutInterval);
                    elem.remove(); // Rimuovi l'elemento dal DOM
                }
            }, timing * 10); // Modificato per una durata più sensibile
        };

        // Esegui il fadeOut dopo il delay
        const timeoutId = setTimeout(() => {
            elem.fadeOut(FADE_OUT_TIMING); // chiama la funzione fadeOut con il timing desiderato
        }, delay || DEFAULT_DELAY); // usa il valore di delay passato o 2000ms di default

        // Cleanup per evitare memory leaks
        return () => clearTimeout(timeoutId);
    }, [delay]); // Esegui l'effetto quando cambia il delay

    return (
        <div className="loader-bg" data-delay={delay} ref={loaderRef}>
            <div className="pc-loader">
                <div className="loader-fill"></div>
            </div>
        </div>
    );
}

export default PreLoader;
