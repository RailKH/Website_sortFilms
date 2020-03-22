const movieBlock = document.querySelector(".block-select .movie");
const block_select = document.querySelector(".main .block-select");
const favBlock = document.querySelector(".favorites .movie");
const loadMore = document.querySelectorAll(".loadMore");
const btnMove = document.querySelector(".btn-move");
const btnFav = document.querySelector(".btn-fav");
const searchBlock = document.querySelector(".search-wrapper_input input");
const inputs = document.querySelectorAll(".tag .tag_input");
let tags = [];
let cinema = [];
const maxItems = 15;
const btn_cinema = document.querySelector(".block-select .loadMore");
const btn_fav = document.querySelector(".favorites .loadMore");
let itemsFilms = [];
let favArray = JSON.parse(localStorage.getItem("fav")) || [];

// Обработчик на кнопку ФИЛЬМЫ
btnMove.addEventListener("click", e => {
  draw();
  if (!e.target.classList.contains("active")) {

    btnFav.classList.remove("active");
    btnMove.classList.add("active");

    block_select.classList.remove("hidden");
    favBlock.classList.add("hidden");
  }
});

// Функция получения списка с фильмами
function getFilms() {
  fetch("./jsons/films.json")
    .then(res => res.json())
    .then(data => {
      cinema = data.filter(elem => {
        return true;
      });

      createMovieBlock(data);
      hideElem();
      getTags();
      locStorFilms();
    });
}
getFilms();

// Функция получения списка с тегами
const getTags = () => {
  fetch("./jsons/tags.json")
    .then(res => res.json())
    .then(data => {
      tags = data.filter(elem => {
        return true;
      });
    });
};

// Функция заполнения страницы
function createMovieBlock(data) {
  data.forEach(elem => {
    const div = document.createElement("div");
    div.classList.add("card-film");

    div.innerHTML = `<p data-tag="${elem.tags}">${elem.title}</p><div class="box"></div>`;

    divMaker(div);
  });
  itemsFilms = document.querySelectorAll(".block-select .card-film");
  draw();
}

// Функция внесение блока на страницу
function divMaker(elem) {
  movieBlock.append(elem);
}

// Функция отрисовки иконки в закладках
function draw() {
  itemsFilms.forEach(elem => {
    elem.lastChild.classList.remove("fav");

    favArray.forEach(item => {
      if (elem.firstChild.textContent == item) {
        elem.lastChild.classList.add("fav");
      }
       });
  });
}

// Функция скрытия элементов
function hideElem() {
  const items = document.querySelectorAll(
      ".block-select .card-film:not(.hidden2)"
    ),
    itemsFav = document.querySelectorAll(".favorites .card-film"),
    hidenClass = "hidden";
  if (items.length <= maxItems) {
    btn_cinema.style.display = "none";
  } else {
    btn_cinema.style.display = "";
  }
  if (itemsFav.length <= maxItems) {
    btn_fav.style.display = "none";
  } else {
    btn_fav.style.display = "";
  }
  items.forEach((item, ind) => {
    if (ind > maxItems - 1) {
      item.classList.add(hidenClass);
    } else {
      item.classList.remove(hidenClass);
    }
  });
 
  itemsFav.forEach((item, ind) => {
    if (ind > maxItems - 1) {
      item.classList.add(hidenClass);
    } else {
      item.classList.remove(hidenClass);
    }
  });
}

// Обработчик кнопки Показать еще
loadMore.forEach(elem => {
  elem.addEventListener("click", e => {
    openElem(e);
  });
});

// Функция отображение скрытых элементов
function openElem(e) {
  const hidenClass =
    "." + e.target.parentNode.className + " .hidden:not(.hidden2)";
  const hidden = document.querySelectorAll(hidenClass);

  hidden.forEach((item, ind) => {
    if (ind < maxItems) {
      item.classList.remove("hidden");
    }
  });
  if (document.querySelectorAll(hidenClass).length == 0) {
    e.target.style.display = "none";
  }
}

// Функция поиска фильма по названию
searchBlock.addEventListener("input", e => {
  const searchText = new RegExp("^" + e.target.value.trim(), "i");
  movieBlock.innerHTML = "";

  itemsFilms.forEach(card => {
    const title = card.querySelector("p");

    if (searchText.test(title.textContent)) {
      divMaker(card);
    }
  });
  hideElem();
});

// Функция поиска фильма по тегу
inputs.forEach(elem => {
  const drop_down = elem.nextElementSibling;

  elem.addEventListener("input", () => {
    drop_down.textContent = "";
    if (elem.value === "") {
      sortTags(elem.value);
      return;
    }
    const filterTags = tags.filter(item => {
      const fixItem = item.toLowerCase();
      return fixItem.includes(elem.value.toLowerCase());
    });
    filterTags.forEach(item => {
      const li = document.createElement("li");
      li.classList.add("drop");
      li.textContent = item;
      drop_down.append(li);
    });

    drop_down.addEventListener("click", e => {
      if (e.target.tagName.toLowerCase() === "li") {
        elem.value = e.target.textContent;
        drop_down.textContent = "";
      }
      sortTags(elem.value);
    });
  });
});

// Функция сортировки по тегу
function sortTags(tag) {
  const items = document.querySelectorAll(".block-select .card-film");
  const inputTags = document.querySelectorAll(".tag .tag_input");

  items.forEach(elem => {
    elem.classList.remove("hidden2");
  });
  inputTags.forEach(elem => {
    drawByTag(elem);
  });
  hideElem();
}

// Функция отрисовки по тегу
function drawByTag(tag) {
  const items = document.querySelectorAll(
    ".block-select .card-film:not(.hidden2)"
  );
  items.forEach(item => {
    if (!tag.value.length == 0) {
      if (item.firstChild.getAttribute("data-tag").indexOf(tag.value) == -1) {
        item.classList.add("hidden2");
      }
    }
  });
}
// Функция работы с LocalStorage в блоке с фильмами
function locStorFilms() {
  itemsFilms.forEach(elem => {
    elem.lastChild.addEventListener("click", e => {
      if (e.target.classList.contains("fav")) {
        e.target.classList.remove("fav");
        favArray.splice(
          favArray.indexOf(e.target.previousSibling.textContent),1
        );
        localStorage.setItem("fav", JSON.stringify(favArray));
      } else {
        e.target.classList.add("fav");
        favArray.push(elem.firstChild.textContent);
        localStorage.setItem("fav", JSON.stringify(favArray));
      }
    });
  });
}

// Обработчик на кнопку ИЗБРАННЫЕ
btnFav.addEventListener("click", e => {
  if (!e.target.classList.contains("active")) {
    btnFav.classList.add("active");
    btnMove.classList.remove("active");

    block_select.classList.add("hidden");
    favBlock.classList.remove("hidden");
    favBlock.innerHTML = "";

    favArray.forEach(elem => {
      const div = document.createElement("div");
      div.classList.add("card-film");
      div.innerHTML = `<p>${elem}</p><div class="box fav"></div>`;
      favBlock.append(div);
    });

    locStorFav();
  }
});

// Функция работы с LocalStorage в блоке избранные
function locStorFav() {
  const itemsFav = document.querySelectorAll(".favorites .card-film");
  hideElem();
  itemsFav.forEach(elem => {
    elem.lastChild.addEventListener("click", e => {
      if (e.target.classList.contains("fav")) {
        e.target.classList.remove("fav");
        favArray.splice(
          favArray.indexOf(e.target.previousSibling.textContent),
          1
        );
        localStorage.setItem("fav", JSON.stringify(favArray));
      } else {
        e.target.classList.add("fav");
        favArray.push(elem.firstChild.textContent);
        localStorage.setItem("fav", JSON.stringify(favArray));
      }
    });
  });
}
