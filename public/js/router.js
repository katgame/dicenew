const route = (event) => {
    event = event || window.event;
    event.preventDefault();
    window.history.pushState({}, "", event.target.href);
    handleLocation();
};

const routes = {
    404: "/pages/404.html",
    "/": "/components/ui/login.html",
    "/dashboard": "/components/sections/dashboard/dashboard.html",
    "/about": "/pages/about.html",
    "/lorem": "/pages/lorem.html",
};
const handleLocation = async () => {
    const path = window.location.pathname;

    const route = routes[path] || routes[404];
    console.log('window.location.route : ' , route)
    const html = await fetch(route).then((data) => data.text());
    //document.getElementById("main-page").innerHTML = html;
    window.location.href = route; 
};

window.onpopstate = handleLocation;
window.route = route;

handleLocation();