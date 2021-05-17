let store = [
    { name: "Tovar1", amount: 2, price: 8 },
    { name: "Tovar2", amount: 1, price: 7 },
    { name: "Tovar3", amount: 5, price: 2 },
    { name: "Tovar4", amount: 1, price: 10 },
    { name: "Tovar5", amount: 3, price: 6 }
];
let basket = [];

//При загрузке документа вызывается функция заполнения списков
document.addEventListener("DOMContentLoaded", () => {
    DataToList();
});

//Функция заполняет списки
function DataToList() {
    document.getElementById("storeList").appendChild(CreateList(store, "store"));
    document.getElementById("basketList").appendChild(CreateList(basket, "basket"));
}

/*Функция создает div, в котором будут храниться строки.
После этого начинается заполнение этого элемента.
Для корзины создается отдельный div, в который будет записана сумма. */
function CreateList(array, listname) {
    var rowContainer = document.createElement('div');
    rowContainer.className = "list listContainer";
    rowContainer.id = listname + "Rows";

    rowContainer.appendChild(TitleInList());
    array.forEach(item => {
        if (item != undefined) {
                var row = document.createElement('div');
                row.addEventListener('click', () => DivClick(row));
                row.className = "row SelectDisabled";
                row = AddInList(item, row);
                rowContainer.appendChild(row);
        }
    });
    if (rowContainer.id == "basketRows") {
        var DivSum = document.createElement('div');
        DivSum.className = "Sum";
        DivSum.innerHTML = SumCalculate(basket);
        rowContainer.appendChild(DivSum);
    }
    return rowContainer
}

/*Функция определяет исходный и конечный списки, 
затем вызывает функцию перемещения товара. */
function DivClick(row) {
    let rowParent = row.parentElement;
    if (rowParent.id === "storeRows") {
        MoveLogic(row, store, basket);
    }
    else if (rowParent.id === "basketRows") {
        MoveLogic(row, basket, store);
    }

}

//Подсчёт суммы стоимости товаров в корзине. 
function SumCalculate(basket) {
    if (basket.length > 0) {
        let sum = 0;
        for (i = 0; i < basket.length; i++) {
            if (basket[i].price != undefined) {
                sum += basket[i].price * basket[i].amount;
            }
        }
        if (sum === 0) {
            return "Корзина пуста";
        } else {
            return "Сумма стоимости товаров: " + sum + " руб.";
        }
    }
    return "Корзина пуста"
}






/*Перемещает единицу товара (row) из одного массива (from) в другой (to). 
Если товар уже присутствует в массиве, то увеличивает 
свойство "amount" (количество) на 1. */
function MoveLogic(row, from, to) {
    let find = false; //Значение true будет означать, что товар найден в массиве (to)
    let findIndex = 0;
    rowName = row.getElementsByClassName("rowName rowText")[0].innerHTML;

    /*Поиск товара в исходном массиве.
    Уменьшает значение свойства amount на 1 */
    for (i = 0; i < from.length; i++) {
        if (from[i] !== undefined) {
            if (from[i].name === rowName) {
                findIndex = i;
                from[i].amount--;
            }
        }
    }

    /*Поиск товара в конечном массиве
    Увеличивает значение свойства amount на 1*/
    if (to.length > 0) {
        for (k = 0; k < to.length; k++) {
            if (to[k] !== undefined) {
                if (to[k].name === rowName) {
                    find = true;
                    to[k].amount++;
                }
            }
        }
    }

    //Если товар не найден в конечном массиве, то добавляет в него новый объект
    if (find == false) {
        let tempobj = Object.assign({}, from[findIndex]);
        tempobj.amount = 1;
        to.push(tempobj);

    }

    if (from[findIndex].amount === 0)
    {
        from.splice(findIndex,1);
    }

    Refresh();
}


//Функция пересоздает элементы в списках
function Refresh() {
    basketElement = document.getElementById("basketRows");
    storeElement = document.getElementById("storeRows");
    basketElement.parentNode.removeChild(basketElement);
    storeElement.parentNode.removeChild(storeElement);
    DataToList();

}
//Функция создает заголовок для списка
function TitleInList() {
    var TitleName = document.createElement('div');
    TitleName.className = "titleName rowText";
    TitleName.innerHTML = "Название";

    var TitlePrice = document.createElement('div');
    TitlePrice.className = "titlePrice rowText";
    TitlePrice.innerHTML = "Цена";

    var TitleAmount = document.createElement('div');
    TitleAmount.className = "titleAmount rowText";
    TitleAmount.innerHTML = "Кол-во";

    var TitleContainer = document.createElement('div');
    TitleContainer.className = "title";
    TitleContainer.appendChild(TitleName);
    TitleContainer.appendChild(TitlePrice);
    TitleContainer.appendChild(TitleAmount);
    return TitleContainer;
}

//Функция создает строку, которая содержит в себе значения объекта из массива
function AddInList(item, row) {
    //Название товара
    var rowElement1 = document.createElement('div');
    rowElement1.className = "rowName rowText";
    rowElement1.innerHTML = item.name;

    //Количество товара
    var rowElement2 = document.createElement('div');
    rowElement2.className = "rowAmount rowText";
    rowElement2.innerHTML = item.amount;

    //Стоимость товара
    var rowElement3 = document.createElement('div');
    rowElement3.className = "rowPrice rowText";
    rowElement3.innerHTML = item.price + "руб.";

    row.appendChild(rowElement1);
    row.appendChild(rowElement2);
    row.appendChild(rowElement3);
    return row;

}