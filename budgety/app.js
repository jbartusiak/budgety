var budgetController = (function (){
    var Expanse = function (id, description, value) {
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage = -1;
    };

    Expanse.prototype.calcPercentage = function (totalIncome) {
        if(totalIncome>0) {
            this.percentage = Math.round(this.value / totalIncome * 100);
        }
        else {
            this.percentage=-1;
        }
    };

    Expanse.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id=id;
        this.description=description;
        this.value=value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum+=cur.value;
        });
        data.totals[type]=sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, desc, val) {
            var newItem, ID;

            if(data.allItems[type].length===0){
                ID=0;
            }
            else {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }

            if(type==='exp') {
                newItem = new Expanse(ID, desc, val);
            }
            else if (type==='inc'){
                newItem = new Income(ID, desc, val);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },
        deleteItem: function(type, id){
            var ids, index;

            ids = data.allItems[type].map(function (curr) {
                return curr.id;
            });

            index = ids.indexOf(id);

            if(index!==-1){
                data.allItems[type].splice(index, 1);
            }
        },
        testing: function () {
            console.log(data);
        },
        calculateBudget: function () {
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.totals.inc-data.totals.exp;

            if(data.totals.inc>0){
                data.percentage = Math.round(data.totals.exp/data.totals.inc * 100)
            }
            else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (curr) {
                curr.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function(){
            return data.allItems.exp.map(function (curr) {
                return curr.getPercentage();
            });
        },

        getBudget: function () {
            return {
                budget: data.budget,
                percentage: data.percentage,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp
            }
        }
    };
})();

var UIController = (function () {
    var DOMStrings = {
        inputType: '.add__type',
        description: '.add__description',
        value: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expansesContainer: '.expenses__list',
        totalIncomeLabel: '.budget__income--value',
        totalExpanseLabel: '.budget__expenses--value',
        budgetLabel: '.budget__value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expansesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var getInputData = function () {
        var type = document.querySelector(DOMStrings.inputType).value;
        var description = document.querySelector(DOMStrings.description).value;
        var value = parseFloat(document.querySelector(DOMStrings.value).value);

        return {
            type,
            description,
            value
        }
    };

    var formatNumber = function(number, type){
        var numSplit, int, dec, sign;
        number = Math.abs(number);
        number = number.toFixed(2);
        numSplit = number.split('.');

        int = numSplit[0];
        dec = numSplit[1];

        if(int.length>3){
            int = int.substr(0, int.length-3)+ '.' +int.substr(int.length-3, 3);
        }
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback){
        for (var i=0; i<list.length; i++){
            callback(list[i], i);
        }
    };

    return {
        getInputData,

        addListItem: function(obj, type){
            var html, newHtml, insertionPoint;
            if(type==='inc') {
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                insertionPoint = document.querySelector(DOMStrings.incomeContainer);
            }
            else if (type==='exp') {
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                insertionPoint = document.querySelector(DOMStrings.expansesContainer);
            }

            newHtml = html
                .replace('%id%', obj.id)
                .replace('%description%', obj.description)
                .replace('%value%', formatNumber(obj.value, type));

            insertionPoint.insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorId){
            var elementToDelete = document.getElementById(selectorId);
            elementToDelete.parentNode.removeChild(elementToDelete);
        },
        clearFields: function(){
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMStrings.description+', '+DOMStrings.value);

            fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach(function(current){
                current.value='';
            });
            fieldsArray[0].focus();
        },

        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.totalIncomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.totalExpanseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);

            if(obj.percentage>=0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMStrings.expansesPercLabel);

            nodeListForEach(fields, function (current, index) {
                if(percentages[index]>0) {
                    current.textContent = percentages[index] + '%';
                }
                else{
                    current.textContent='---';
                }
            });
        },

        displayMonth: function(){
            var now, year, month, months;
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
            document.querySelector(DOMStrings.dateLabel).textContent=months[month]+' '+year;
        },

        changedType: function(){
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.description+ ',' +
                DOMStrings.value
            );

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputButton).classList.toggle('red');
        },

        getDOMStrings: function () {
            return DOMStrings;
        }
    }
})();

var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.addEventListener('keypress', function (event) {
            if(event.keyCode===13 || event.which===13){
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function () {
        //calculate the budget
        budgetCtrl.calculateBudget();
        //return the budget
        var budget = budgetCtrl.getBudget();
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function () {
        budgetCtrl.calculatePercentages();
        let percentages = budgetCtrl.getPercentages();
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function () {
        //get input data
        var input = UICtrl.getInputData();

        if(input.description!=='' && !isNaN(input.value)) {
            //add item to budget controller
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            //add item to UI
            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearFields();
            updateBudget();
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemId, splitId, type, id;

        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemId){
            splitId = itemId.split('-');
            type = splitId[0];
            id = parseInt(splitId[1]);
            budgetCtrl.deleteItem(type, id);
            UICtrl.deleteListItem(itemId);
            updateBudget();
            updatePercentages();
        }
    };

    return {
        init: function () {
            console.log('Application started');
            UICtrl.displayBudget({
                budget: 0,
                percentage: -1,
                totalInc: 0,
                totalExp: 0
            });
            setupEventListeners();
            UICtrl.displayMonth();
        }
    }

})(budgetController, UIController);

controller.init();