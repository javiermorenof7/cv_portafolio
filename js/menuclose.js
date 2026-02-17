// Auto-close mobile menu when clicking navigation links
document.addEventListener('DOMContentLoaded', function () {
    const menuCheckbox = document.getElementById('open-menu');
    const navLinks = document.querySelectorAll('.header__nav-item a');

    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            // Close the menu by unchecking the checkbox
            if (menuCheckbox) {
                menuCheckbox.checked = false;
            }
        });
    });
});
