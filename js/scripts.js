document.addEventListener("DOMContentLoaded", main);

function main() {
  // Tema modu seçme
  document
    .getElementById("theme-switcher")
    .addEventListener("click", function () {
      document.querySelector("body").classList.toggle("light");
      const themeImg = this.children[0];
      themeImg.setAttribute(
        "src",
        themeImg.getAttribute("src") === "./assets/images/icon-sun.svg"
          ? "./assets/images/icon-moon.svg"
          : "./assets/images/icon-sun.svg"
      );
    });
  // Bütün todoları listeleme
  addTodo();
  // Todo sürükle bırak fonksiyonu
  document.querySelector(".todos").addEventListener("dragover", function (e) {
    e.preventDefault();
    if (
      !e.target.classList.contains("dragging") &&
      e.target.classList.contains("card")
    ) {
      const draggingCard = document.querySelector(".dragging");
      const cards = [...this.querySelectorAll(".card")];
      const currPos = cards.indexOf(draggingCard);
      const newPos = cards.indexOf(e.target);
      console.log(currPos, newPos);
      if (currPos > newPos) {
        this.insertBefore(draggingCard, e.target);
      } else {
        this.insertBefore(draggingCard, e.target.nextSibling);
      }
      const todos = JSON.parse(localStorage.getItem("todos"));
      const removed = todos.splice(currPos, 1);
      todos.splice(newPos, 0, removed[0]);
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  });
  // Kullanıcı giriş alanı
  const add = document.getElementById("add-btn");
  const txtInput = document.querySelector(".txt-input");
  add.addEventListener("click", function () {
    const item = txtInput.value.trim();
    if(item.length==0){
      alert("Görev alanını boş geçemezsin!");
      return;
    }
    if (item) {
      txtInput.value = "";
      const todos = !localStorage.getItem("todos")
        ? []
        : JSON.parse(localStorage.getItem("todos"));
      const currentTodo = {
        item,
        isCompleted: false,
      };
      addTodo([currentTodo]);
      todos.push(currentTodo);
      localStorage.setItem("todos", JSON.stringify(todos));
    }
    txtInput.focus();
  });
  // Enter tuşu ile todo ekleme
  txtInput.addEventListener("keydown", function (e) {
    if (e.keyCode === 13) {
      add.click();
    }
  });
  // Todo filtreleme. Tümü - Aktif - Tamamlanan 
  document.querySelector(".filter").addEventListener("click", function (e) {
    const id = e.target.id;
    if (id) {
      document.querySelector(".on").classList.remove("on");
      document.getElementById(id).classList.add("on");
      document.querySelector(".todos").className = `todos ${id}`;
    }
  });
  // Tüm tamamlananları silme 
  document
    .getElementById("clear-completed")
    .addEventListener("click", function () {
      deleteIndexes = [];
      document.querySelectorAll(".card.checked").forEach(function (card) {
        deleteIndexes.push(
          [...document.querySelectorAll(".todos .card")].indexOf(card)
        );
        card.classList.add("fall");
        card.addEventListener("animationend", function (e) {
          setTimeout(function () {
            card.remove();
          }, 100);
        });
      });
      removeManyTodo(deleteIndexes);
    });
}

/* Todoyu tamamlandı olarak işratleme*/

function stateTodo(index, completed) {
  const todos = JSON.parse(localStorage.getItem("todos"));
  todos[index].isCompleted = completed;
  localStorage.setItem("todos", JSON.stringify(todos));
}

/* Listeden bir tane todo silme fonksiyonu */

function removeTodo(index) {
  const todos = JSON.parse(localStorage.getItem("todos"));
  todos.splice(index, 1);
  localStorage.setItem("todos", JSON.stringify(todos));
}

/* Listeden toplu todo silme fonksiyonu*/

function removeManyTodo(indexes) {
  let todos = JSON.parse(localStorage.getItem("todos"));
  todos = todos.filter(function (todo, index) {
    return !indexes.includes(index);
  });
  localStorage.setItem("todos", JSON.stringify(todos));
}

/* Listeye todo ekleme fonksiyonu */

function addTodo(todos = JSON.parse(localStorage.getItem("todos"))) {
  if (!todos) {
    return null;
  }
  const itemsLeft = document.getElementById("items-left");
  // Kart oluşturma
  todos.forEach(function (todo) {
    const card = document.createElement("li");
    const cbContainer = document.createElement("div");
    const cbInput = document.createElement("input");
    const check = document.createElement("span");
    const item = document.createElement("p");
    const button = document.createElement("button");
    const img = document.createElement("img");
    // Class ekleme
    card.classList.add("card");
    button.classList.add("clear");
    cbContainer.classList.add("cb-container");
    cbInput.classList.add("cb-input");
    item.classList.add("item");
    check.classList.add("check");
    button.classList.add("clear");
    // Tanımalamalar
    card.setAttribute("draggable", true);
    img.setAttribute("src", "./assets/images/icon-cross.svg");
    img.setAttribute("alt", "Temizle");
    cbInput.setAttribute("type", "checkbox");
    // Todo işaretleme
    item.textContent = todo.item;
    // Tamamlanan todoları işaretleme
    if (todo.isCompleted) {
      card.classList.add("checked");
      cbInput.setAttribute("checked", "checked");
    }
    // Todo sürükleme için fonksiyon
    card.addEventListener("dragstart", function () {
      this.classList.add("dragging");
    });
    card.addEventListener("dragend", function () {
      this.classList.remove("dragging");
    });
    // Checkboxlar için eventlistener
    cbInput.addEventListener("click", function () {
      const correspondingCard = this.parentElement.parentElement;
      const checked = this.checked;
      stateTodo(
        [...document.querySelectorAll(".todos .card")].indexOf(
          correspondingCard
        ),
        checked
      );
      checked
        ? correspondingCard.classList.add("checked")
        : correspondingCard.classList.remove("checked");
      itemsLeft.textContent = document.querySelectorAll(
        ".todos .card:not(.checked)"
      ).length;
    });
    // Temizleme butonu için eventlistener 
    button.addEventListener("click", function () {
      const correspondingCard = this.parentElement;
      correspondingCard.classList.add("fall");
      removeTodo(
        [...document.querySelectorAll(".todos .card")].indexOf(
          correspondingCard
        )
      );
      correspondingCard.addEventListener("animationend", function () {
        setTimeout(function () {
          correspondingCard.remove();
          itemsLeft.textContent = document.querySelectorAll(
            ".todos .card:not(.checked)"
          ).length;
        }, 100);
      });
    });
    button.appendChild(img);
    cbContainer.appendChild(cbInput);
    cbContainer.appendChild(check);
    card.appendChild(cbContainer);
    card.appendChild(item);
    card.appendChild(button);
    document.querySelector(".todos").appendChild(card);
  });
  // Kalan todoları güncelleme
  itemsLeft.textContent = document.querySelectorAll(
    ".todos .card:not(.checked)"
  ).length;
}
