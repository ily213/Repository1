let store = [
    { name: "Tovar1", amount: 2, price: 8 },
    { name: "Tovar2", amount: 1, price: 7 },
    { name: "Tovar3", amount: 5, price: 2 },
    { name: "Tovar4", amount: 1, price: 10 },
    { name: "Tovar5", amount: 3, price: 6 }
];
let basket = [];


//Функция вызывает создание элементов
webix.ready(function () {
    CreateElements();
    AttachEvents();
})


function CreateElements() {
    webix.ui({
        width: 780,
        height: 500,
        cols: [
            {
                rows: [
                    {
                        css: "title",
                        id: "TitleBasket",
                        view: "template",
                        type: "header",
                        template: "Склад",
                    },
                    {
                        css: "list",
                        id: "storeListID",
                        view: "datatable",
                        height: 400,
                        columns: [
                            { id: "name", header: "Название", width: 150, css: "SelectDisabled row" },
                            { id: "amount", header: "Количество", width: 113, css: "SelectDisabled row" },
                            { id: "price", header: "Цена", width: 80, css: "SelectDisabled row", template: "#price# руб." }
                        ],
                        data: store,
                        select: "row",
                        width: 360,
                    },
                    {
                        view: "button",
                        id: "addButton",
                        value: "Добавить товар",
                        css: "webix_primary",
                        inputWidth: 200,
                    }


                ]
            },
            {

            },
            {
                rows: [
                    {
                        css: "title",
                        id: "TitleStore",
                        view: "template",
                        type: "header",
                        template: "Корзина",
                        width: 360,
                    },
                    {
                        css: "list",
                        id: "basketListID",
                        view: "datatable",
                        height: 400,
                        columns: [
                            { id: "name", header: "Название", width: 150, css: "SelectDisabled row" },
                            { id: "amount", header: "Количество", width: 113, css: "SelectDisabled row" },
                            { id: "price", header: "Цена", width: 80, css: "SelectDisabled row", template: "#price# руб." }
                        ],
                        data: basket,
                        select: "row",
                        width: 360,
                    },
                    {
                        css: "Sum",
                        id: "priceSum",
                        view: "template",
                        template: "Корзина пуста",
                        autoheight: false,
                        height: 25

                    }
                ]
            }
        ]
    })
    var addformwindow = webix.ui(
        {
            view: "window",
            id: "addform",
            head: "Добавить товар",
            width: 500,
            modal: true,
            relative: "right",
            height: 300,
            close: true,
            body: {
                view: "form",
                elements: [
                    { view: "text", id: "nameInput", label: "Название", name: "name", width: 250 },
                    { view: "text", id: "priceInput", label: "Цена", name: "price", width: 150 },
                    { view: "text", id: "amountInput", label: "Кол-во", name: "amount", width: 150 },
                    {
                        cols: [
                            { view: "button", id: "button1", value: "Добавить", css: "webix_primary", width: 150 }
                        ]
                    }
                ]
            }
        }
    )





}

//Функция создает новый объект из значений формы "addform" и добавляет в массив store
function AddButton() {
    let getname = $$("nameInput").getValue();
    let getprice = $$("priceInput").getValue();
    let getamount = $$("amountInput").getValue();
    let tovar = { name: getname, price: getprice, amount: getamount };
    if (getname.length > 0 && webix.rules.isNumber(getprice) && webix.rules.isNumber(getamount)) {
        if (CheckArray.call(store, tovar) || CheckArray.call(basket, tovar)) {
            if (CheckPrice.call(store, tovar)) {
            } else if (CheckPrice.call(basket, tovar)) {
                store.push(tovar);
            } else {
                alert("Товар с таким названием уже существует");
            }
        } else {
            store.push(tovar);
        }
    } else {
        alert("Введены неверные значения");
    }
    $$("addform").hide();
    Refresh("storeListID", store);
}

//Функция считает суммарную стоимость товаров в корзине
function SumCount() {

    sum = 0;
    for (i = 0; i < basket.length; i++) {
        sum += basket[i].price * basket[i].amount;
    }
    if (sum === 0) {
        sum = "Корзина пуста";
    } else {
        sum = "Суммарная стоимость товаров: " + sum + " руб.";
    }
    $$("priceSum").setHTML(sum);
}

//Функция перемещает единицу товара из исходного массива (from) в конечный (to)
function Move(row, from, to) {
    let find = false; //Значение true будет означать, что товар найден в массиве (to)
    let findIndex = 0;
    rowName = row.name;

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

    if (from[findIndex].amount === 0) {
        from.splice(findIndex, 1);
    }
    Refresh("storeListID", store);
    Refresh("basketListID", basket);
    SumCount("basketList", basket);

}

//Функция удаляет все строки и добавляет их заново
function Refresh(id, array) {
    var datatable = $$(id);
    datatable.clearAll();
    datatable.parse(array);
}

//Функция проверяет массив на наличие товара с указанным названием
function CheckArray(tovar) {
    var check = false;
    this.forEach(item => {
        if (item.name === tovar.name) {
            check = true;
        }
    })
    return check;
}

/*Функция проверяет массив на наличие товара с указанным названием и ценой.
Если такой объект найден, то увеличивает его количество (amount)*/
function CheckPrice(tovar) {
    var check = false;
    this.forEach(item => {
        if (item.price == tovar.price && item.name == tovar.name) {
            check = true;
            if (this == store) {
                item.amount = parseInt(item.amount) + parseInt(tovar.amount);
            }
        }
    })
    return check;
}

//Функция добавляет события к элементам
function AttachEvents() {
    $$("storeListID").attachEvent("onItemClick", function () {
        let row = this.getSelectedItem();
        Move(row, store, basket);
    });
    $$("basketListID").attachEvent("onItemClick", function () {
        let row = this.getSelectedItem();
        Move(row, basket, store);
    });
    $$("button1").attachEvent("onItemclick", AddButton);
    $$("addButton").attachEvent("onItemClick", function () {
        $$("addform").show();
        $$("nameInput").setValue("");
        $$("priceInput").setValue("");
        $$("amountInput").setValue("");
    })

}