// =========================================
// CAMPUSCARE SPLASH SCREEN
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    const splash =
        document.getElementById("campuscareSplash");

    const progress =
        document.getElementById("splashProgress");


    if (!splash) {
        console.error(
            "CampusCare splash element not found."
        );

        return;
    }


    if (!progress) {
        console.error(
            "CampusCare splash progress element not found."
        );

        return;
    }


    console.log(
        "CampusCare splash loaded."
    );


    // -----------------------------------------
    // PROGRESS ANIMATION
    // -----------------------------------------

    let value = 0;


    const timer =
        setInterval(() => {

            value += 10;


            if (value >= 100) {

                value = 100;

                clearInterval(timer);

            }


            progress.style.width =
                value + "%";


        }, 80);



    // -----------------------------------------
    // HIDE AFTER 1 SECOND
    // -----------------------------------------

    setTimeout(() => {

        progress.style.width =
            "100%";


        setTimeout(() => {

            splash.classList.add(
                "splash-hidden"
            );


            setTimeout(() => {

                splash.remove();

            }, 600);


        }, 150);


    }, 900);

});