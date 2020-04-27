const hashId = (str) => `${str + Math.round(Math.random() * 1e8).toString(16) + (Math.round(Math.random() * str.charCodeAt(Math.round(Math.random() * str.length))).toString() + Math.round(Math.random() * str.charCodeAt(Math.round(Math.random() * str.length))).toString()).toString(16)}`

const totalBalanceAmount = document.querySelector('.total-balance__amount'),
    totalIncomeAmount = document.querySelector('.total-income__amount'),
    totalExpendAmount = document.querySelector('.total-expend__amount'),
    form = document.getElementById('form'),
    formTypeSelect = document.querySelector('.form__type-select'),
    formNameInput = document.querySelector('.form__name-input'),
    formDateInput = document.querySelector('.form__date-input'),
    formAmountInput = document.querySelector('.form__amount-input'),
    formCommentInput = document.querySelector('.form__comment-input'),
    historyListMenu = document.querySelector('.history-list_menu'),
    question = document.querySelector('.question')

let dataBase = [
    // {
    // "id": "adasdas7744444434",
    // "type": "Доход",
    // "name": "Adasdas",
    // "date": "17.04.2020",
    // "amount": 123123,
    // "comment": "Asdas"
    // }
]

// функция для отпрвки данных - встречается в init
const postData = () => {
    const headers = {
        'Content-Type': 'application/json'
    }
    return fetch('func.php', {
        method: 'POST',
        body: JSON.stringify(dataBase),
        headers: headers
    })
}

//функция для принятия данных - встречается в init
const getData = () => fetch('data.json').then(response => response.text())

// функция для обработки суммы - 1000000 -> 1 000 000
const separate = (str) => {
    let out;

    for (let ind = 0; ind < str.length; ind++) {
        const el = str[ind];
        if (el === " ") {
            return str
        } else {
            out = str.split("").reverse().map((v, i) => (i % 3 == 0) ? v + " " : v).reverse().join("")

            return out
        }
    }
}

//обратная функция separate - 1 000 000 -> 1000000
const unit = (str) => {
    const out = str.split(' ')
    return +out.join('')
}

//Функция верстки истории
const renderList = (obj) => {
    const li = document.createElement('li')
    const className = obj.type === 'Доход' ? 'history-income' : 'history-expend'
    const operator = obj.type === 'Доход' ? '+' : '-'
    li.classList.add('history-list')
    li.classList.add(className)

    li.innerHTML = `
        <p class="history-id">${obj.id}</p>
        <p class="history-name">${obj.name}</p>
        <p class="history-date">${obj.date}</p>
        <p class="history-amount">${operator} ${separate(obj.amount.toString())}</p>
        <p class="history-comment">${obj.comment}</p>
        <span class="history-del">X</span>
    `

    historyListMenu.append(li)
}

// функция для подсчета баланса
const result = (obj) => {
    const income = obj
        .filter(item => item.type === 'Доход')
        .reduce((res, item) => res + +item.amount, 0)

    const expend = obj
        .filter(item => item.type === 'Расход')
        .reduce((res, item) => res + +item.amount, 0)

    totalIncomeAmount.textContent = separate(income.toString())
    totalExpendAmount.textContent = separate(expend.toString())

    totalBalanceAmount.textContent = separate((income - expend).toString())

}

// Функция для правильности вывода даты
const correctDate = (date) => {
    const newDate = new Date(date),
        day = newDate.getDate() < 10 ? '0' + newDate.getDate() : newDate.getDate(),
        month = (newDate.getMonth() + 1) < 10 ? '0' + (newDate.getMonth() + 1) : (newDate.getMonth() + 1),
        year = newDate.getFullYear()

    return `${day}.${month}.${year}`
}

// Функция для оглавления строки - первая буква заглавная
const correctName = (str) => {
    let correctNameStr = str[0].toString().toUpperCase()

    for (let i = 1; i < str.length; i++) {
        const e = str[i]
        correctNameStr += e
    }

    return correctNameStr
}

// Инициализация всего проекта (принятия данных из json, отправка, создание объекта, подсчет баланса)
const init = () => {
    historyListMenu.textContent = ''

    postData().then(() => {
        getData()
            .then(data => dataBase = JSON.parse(data))
            .then(data => {
                data.forEach(item => renderList(item))
                result(data)
            })
            .catch(e => {
                e.data = new Error('Что то пошло не так')
                throw e
            })
    })


}

// Удаление всей истории операций
const removeHistory = () => {
    dataBase = dataBase.filter(el => el.data === 1)
    init()
    question.style.display = 'none'
}

// обработка инпутов создание через них объекта
const add = (e) => {
    e.preventDefault()

    formNameInput.style.borderColor = ''
    formDateInput.style.borderColor = ''
    formAmountInput.style.borderColor = ''

    if (formNameInput.value && formDateInput.value && formAmountInput.value) {


        const operationData = {
            id: hashId(formNameInput.value),
            type: formTypeSelect.value,
            name: correctName(formNameInput.value),
            date: correctDate(formDateInput.value),
            amount: unit(formAmountInput.value),
            comment: formCommentInput.value ? formCommentInput.value : ''
        }

        dataBase.unshift(operationData)
        init()

        formNameInput.value = ''
        formTypeSelect.value = 'Доход'
        formDateInput.value = ''
        formAmountInput.value = ''
        formCommentInput.value = ''
    } else {
        if (!formNameInput.value) formNameInput.style.borderColor = 'red'
        if (!formDateInput.value) formDateInput.style.borderColor = 'red'
        if (!formAmountInput.value) formAmountInput.style.borderColor = 'red'
    }
}

// удаление одной истории
const deleteList = (event) => {
    if (event.target.classList.contains('history-del')) {

        const parent = event.path[1],
            id = parent.children[0].textContent

        dataBase = dataBase.filter(el => el.id.toString() !== id.toString())

        init()
    }
}

init()


form.addEventListener('submit', add) // сработате при отправке формы

historyListMenu.addEventListener('click', deleteList) // сработает при нажатии крестика на операции

// сработает при нажатии на конпку в паровм углу экрана
remove.addEventListener('click', (e) => {
    e.preventDefault()
    question.style.display = 'block'
})

// подтверждение на удаление всей истории
yes.addEventListener('click', removeHistory)
no.addEventListener('click', () => question.style.display = 'none')