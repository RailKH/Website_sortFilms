const movieBlock = document.querySelector(".movie-block");
const favBlock = document.querySelector(".fav-block");
const inputSearch = document.querySelector(".search-wrapper_input input");
const searchWrapper = document.querySelector(".search-wrapper");
const inputTagsBlock = document.querySelector(".tag");
const loadMoreBtn = document.querySelector(".loadMore");
const selectBlockBtn = document.querySelector(".select");
const selectFilmsBlock = document.querySelector(".sel-film-block");

let favCinema = JSON.parse(localStorage.getItem("fav")) || [];

const maxItems = 15;

let cinema = [];
let tags = [];
let sortFilms = [];

const getData = async function (url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Error ${url}, status ${response.status}`);
    }
    return await response.json();
};

function checkFavFilms(favFilm, event) {
    const item = favCinema.find((item) => {
        return item.title == favFilm;
    });
    if (item) {
        favCinema.splice(
            favCinema.findIndex((item) => item.title == favFilm),
            1
        );
        event.target.classList.remove("select-fav-film");
    } else {
        favCinema.push({ title: favFilm, fav: true });
        event.target.classList.add("select-fav-film");
    }
}

function addToFav(event) {
    if (event.target.classList.contains("fav-box")) {
        const favFilm = event.target.previousElementSibling.textContent;
        checkFavFilms(favFilm, event);
        localStorage.setItem("fav", JSON.stringify(favCinema));
        if (event.target.closest(".fav-block")) {
            event.target.parentElement.remove();
            hideElements("fav-block");
        }
    }
}

function getFavBlock() {
    cinema.forEach((item) => (item.fav = false));
    if (favCinema) {
        favCinema.forEach((item) => {
            cinema.forEach((value) => {
                if (item.title == value.title) {
                    value.fav = true;
                }
            });
        });
    }
}

function createCardFilm(cinema) {
    const { title, tags, fav } = cinema;
    const value = fav ? "select-fav-film" : "";
    const cinema_block = `
      <div class="card-film"><p data-tag="${tags}">${title}</p><div class="fav-box ${value}"></div></div>`;
    if (tags) {
        movieBlock.insertAdjacentHTML("beforeend", cinema_block);
    } else {
        favBlock.insertAdjacentHTML("beforeend", cinema_block);
    }
}

function selectBlock(event) {
    if (event.target.classList.contains("btn-select")) {
        if (!event.target.classList.contains("active")) {
            for (let elem of selectBlockBtn.children) {
                elem.classList.toggle("active");
            }

            for (let elem of selectFilmsBlock.children) {
                elem.classList.toggle("hidden");
            }

            if (event.target.classList.contains("favorites")) {
                favBlock.innerHTML = "";
                favCinema.forEach(createCardFilm);
                hideElements("fav-block");
                searchWrapper.classList.add("hidden");
            } else {
                movieBlock.innerHTML = "";
                getFavBlock();
                cinema.forEach(createCardFilm);
                hideElements("movie-block");
                searchWrapper.classList.remove("hidden");
            }
        }
    }
}

function searchFilms(event) {
    movieBlock.innerHTML = "";
    const target = event.target;
    const searchText = new RegExp("^" + target.value.trim(), "i");

    const films = cinema.filter((item) => {
        return searchText.test(item.title);
    });

    films.forEach(createCardFilm);
    sortFilms = films.slice();
    sortWithTags();
}

function createDropDown(event) {
    const target = event.target;
    const drop_down = target.nextElementSibling;
    drop_down.textContent = "";

    if (target.value === "") {
        sortWithTags();
        return;
    }
    const filterTags = tags.filter((item) => {
        const fixItem = item.toLowerCase();
        return fixItem.includes(target.value.toLowerCase());
    });

    filterTags.forEach((item) => {
        const li = `<li class='drop'>${item}</li>`;
        drop_down.insertAdjacentHTML("beforeend", li);
    });

    drop_down.addEventListener("click", (e) => {
        if (e.target.tagName.toLowerCase() === "li") {
            target.value = e.target.textContent;
            drop_down.textContent = "";
        }
        sortWithTags();
    });
}

function sortWithTags() {
    const inputTags = document.querySelectorAll(".tag .tag_input");
    let films = sortFilms.slice();

    movieBlock.innerHTML = "";
    inputTags.forEach((tag) => {
        if (tag.value) {
            films.forEach((item, ind) => {
                if (!item.tags.includes(tag.value)) {
                    delete films[ind];
                }
            });
        }
    });

    films.forEach(createCardFilm);
    hideElements("movie-block");
}

function hideElements(valueBlocks) {
    const cardFilm = document.querySelectorAll(`.${valueBlocks} .card-film`);
    cardFilm.forEach((item, ind) => {
        if (ind > maxItems - 1) {
            item.classList.add("hidden");
        } else item.classList.remove("hidden");
    });
    checkHideElements(valueBlocks);
}

function checkHideElements(valueBlocks) {
    const films = document.querySelectorAll(`.${valueBlocks} .hidden`);

    if (films.length == 0) {
        loadMoreBtn.style.display = "none";
    } else {
        loadMoreBtn.style.display = "";
    }
}

function openElements(event) {
    let valueBlocks = "";

    for (let elem of selectFilmsBlock.children) {
        if (!elem.classList.contains("hidden")) {
            valueBlocks = elem.className;
        }
    }

    const hiddenElements = document.querySelectorAll(`.${valueBlocks} .hidden`);
    hiddenElements.forEach((item, ind) => {
        if (ind < maxItems) {
            item.classList.remove("hidden");
        }
    });
    checkHideElements(valueBlocks);
}

async function init() {
    await getData("./jsons/films.json").then((data) => {
        cinema = data.slice();
        sortFilms = data.slice();
        getFavBlock();
        cinema.forEach(createCardFilm);
    });
    getData("./jsons/tags.json").then((data) => {
        tags = data.slice();
    });
    hideElements("movie-block");
    inputSearch.addEventListener("input", searchFilms);
    inputTagsBlock.addEventListener("input", createDropDown);
    loadMoreBtn.addEventListener("click", openElements);
    movieBlock.addEventListener("click", addToFav);
    favBlock.addEventListener("click", addToFav);
    selectBlockBtn.addEventListener("click", selectBlock);
}

init();
