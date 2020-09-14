export const cursor = document.querySelector(".cursor");

export const initCursorEventListeners = function () {
  document.addEventListener("mousemove", e => {
    cursor.setAttribute("style", `top:${e.pageY}px; left:${e.pageX}px;`);
  });

  const links = document.querySelectorAll("a");
  links.forEach(a => {
    a.addEventListener("mouseover", e => {
      cursor.classList.add("cursor__hover");
    });

    a.addEventListener("mouseout", e => {
      cursor.classList.remove("cursor__hover");
    });
  });
}
