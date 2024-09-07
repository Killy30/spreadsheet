const $ = (element) => document.querySelector(element)
const $$ = (element) => document.querySelectorAll(element)

const COLUMNS = 7;
const ROWS = 15
const ALPHABET_CHARCODE = 65;

let theCellElement = null;

const $table = $('table')
const $thead = $('thead')
const $tbody = $('tbody')
const $mainInput = $('#cell_selected_input')

const range = (length) => Array.from({ length }, (v, i) => i)
const getAlphabet = (num) => String.fromCharCode(ALPHABET_CHARCODE+num)
let STATE = range(COLUMNS).map(c => range(ROWS).map(r => ({formula: '', value: ''})))

function showSpreadSheet(){
    $thead.innerHTML = `<tr>
        <th></th>
        ${range(COLUMNS).map(column => `<th>${getAlphabet(column)}</th>`).join('')}
    </tr>`

    $tbody.innerHTML = ''
    range(ROWS).map(row => {
        return $tbody.innerHTML += `<tr>
            <td class="table-light">${row + 1}</td>
            ${range(COLUMNS).map(column => {
                return `<td data-a="${getAlphabet(column)}" data-id="${`${getAlphabet(column)}${row+1}`}" data-x="${column}" data-y="${row}">
                    <span>${STATE[column][row].formula}</span>
                    <input type="text" class="border-0 d-none" id="${`${getAlphabet(column)}${row+1}`}" value="${STATE[column][row].value}">
                </td>`
            }).join('')}
        </tr>`
    }).join('')
}

showSpreadSheet()

function showCellSelected(element){

    if(element.dataset.x == undefined) return

    $$('.border-primary').forEach(el =>{
        el.classList.remove('border-2', 'border-primary')
        el.querySelector('input').classList.add('d-none')
        el.querySelector('span').classList.remove('d-none')
    })

    theCellElement = element
    const {a, x, y} = element.dataset;

    element.classList.add('border-2', 'border-primary')

    $('#cell_selected').innerText = `${a}${parseInt(y)+1}`
    $mainInput.value = STATE[x][y].value
}

function generateCellsConst(state){
    return state.map((rows, x) => {
        return rows.map((cell, y) => {
            const a = getAlphabet(x)
            const cellId = `${a}${y+1}`
            return `const ${cellId} = ${(cell.formula != '') ? cell.formula : 0};`
        }).join('\n')
    }).join('\n')
}

function updateTheCell({value, x, y, $input}){

    const xvalue = value.match(/[A-Z]+\d/g)

    const newState = STATE;
    const constantValues = generateCellsConst(newState);
    const formula = calculateCellValue(value, constantValues)

    console.log(formula);
    console.log($input);
    
    if(formula.error == null){
        const cell = newState[x][y] 
        cell.formula = formula.value
        cell.value = value

        newState[x][y] = cell;

        updateAllCell(newState, generateCellsConst(newState))

        STATE = newState

        showSpreadSheet()
    }else{
        alert(formula.error)
        $input.focus()
    }
}

function updateAllCell(state, constantValues){
    state.forEach(rows =>{
        rows.forEach(cell =>{
            const valueCalculated = calculateCellValue(cell.value, constantValues)
            cell.formula = valueCalculated.value
        })
    })
}

function calculateCellValue(value, constantValues){
    let valueCalculeted = {value:value, error: null}

    if(!value.startsWith('=')) return valueCalculeted;

    const formula = value.substring(1)

    if(formula == '') return valueCalculeted

    // console.log(constantValues);
    try {
        valueCalculeted.value = eval(`(()=> {
            ${constantValues}
            return ${formula}
        })()`)
    } catch (error) {
        valueCalculeted.error = `!ERROR: ${error}`
    }
    return valueCalculeted;
}

$tbody.addEventListener('click', e =>{
    const td = e.target.closest('td');
    if(!td) return
    showCellSelected(td)
})

$tbody.addEventListener('dblclick', e => {
    const td = e.target.closest('td');

    if(!td) return
    
    const {x, y} = td.dataset
    const $span = td.querySelector('span');
    const $input = td.querySelector('input');

    $span.classList.add('d-none')
    $input.classList.remove('d-none')

    const end = $input.value.length;
    $input.setSelectionRange(end, end)
    $input.focus()

    $input.addEventListener('blur', e => {
        if($input.value == STATE[x][y].value) return

        updateTheCell({value: $input.value, x, y, $input})
    }, {once: true})

    $input.addEventListener('keypress', e => {
        if(e.key === 'Enter') $input.blur()

    })

    $input.addEventListener("keyup", e => {
        $mainInput.value = $input.value
    })

})

$mainInput.addEventListener('keyup', e =>{
    if(theCellElement == null) return
    
    
    const {x, y} = theCellElement.dataset;
    const $input = theCellElement.querySelector('input');
    const $span = theCellElement.querySelector('span');

    if(!$span.classList.contains('d-none')){
        $span.classList.add('d-none')
    }

    $input.classList.remove('d-none')
    $input.value = e.target.value
    
    if(e.key === 'Enter') e.target.blur();

    $mainInput.addEventListener('blur', e => {
        if($input.value == STATE[x][y].value) return

        updateTheCell({value: e.target.value, x, y, $input: $mainInput}) 
        $input.classList.add('d-none')
        $span.classList.remove('d-none')
        
    },{once: true})
})




