
let divId = 0;
let divList = [];

function nextId() {
    divId++;
    return divId + '';
}

let selectedDivsId = [];
let selectionColor = '#86c5ff';

let defaultStyle = [
    newStyleProp('width', 100, 'px'),
    newStyleProp('height', 100, 'px'),
    newStyleProp('borderColor', 'black'),
    newStyleProp('borderStyle', 'solid'),
    newStyleProp('borderWidth', 1, 'px'),
    newStyleProp('position', 'absolute'),
    newStyleProp('cursor', 'move')
];

function getDefaultStyle() {
    return defaultStyle.map(prop => {
        return {
            name: prop.name,
            value: prop.value,
            unity: prop.unity
        }
    });
}

function selectDiv(id) {
    if (!id) {
        return;
    }
    div = document.getElementById(id);
    if (!div) {
        return;
    }
    if (selectedDivsId.includes(id)) {
        selectedDivsId = selectedDivsId.filter(sid => sid != id);
        let obj = divList.find(o => o.id == id);
        let prop = obj.style.find(p => p.name == 'backgroundColor');
        if (!prop) {
            div.style.backgroundColor = null;
            verifyPropertyEditorValues();
            return;
        }
        div.style.backgroundColor = prop.value;
        verifyPropertyEditorValues();
        return;
    }
    selectedDivsId.push(id);
    div.style.backgroundColor = selectionColor;
    verifyPropertyEditorValues();
}

function verifyPropertyEditorValues() {
    if (selectedDivsId.length == 0 || selectedDivsId.length > 1) {
        setValuesOnCssEditor(getAllCssProps());
        return;
    }
    let obj = divList.find(o => o.id == selectedDivsId[0]);
    if (obj) {
        setValuesOnCssEditor(obj.style);
    }
}

function selectAll() {
    divList.forEach(obj => selectDiv(obj.id));
}

function deleteDivs() {
    [...selectedDivsId].forEach(id => deleteDivById(id));
}

function deleteDivById(id) {
    if (!id) {
        return;
    }
    div = document.getElementById(id);
    if (!div) {
        return;
    }
    let container = document.getElementById("container");
    container.removeChild(div);
    selectedDivsId = selectedDivsId.filter(sid => sid != id);
    divList = divList.filter(o => o.id != id);
}

function newDivObj() {
    let id = nextId();
    let docXY = getDocumentXY();
    let x = docXY.x + 30;
    let y = docXY.y + 30;
    let selectedStyle = getDefaultStyle();
    if (selectedDivsId.length == 1) {
        selectedStyle = [...divList.find(o => o.id == selectedDivsId[0]).style];
        selectedStyle = selectedStyle.filter(p => p.name != 'left' && p.name != top && p.name != 'zIndex');
    }
    let style = [
        ...selectedStyle,
        newStyleProp('left', x, 'px'),
        newStyleProp('top', y, 'px'),
        newStyleProp('zIndex', id)
    ];
    let divobj = { id, style };
    divList.push(divobj);
    return divobj;
}

function newBlock() {
    let divobj = newDivObj();
    let div = createDiv(divobj);
    document.getElementById("container").appendChild(div);
}

function newCircle() {
    let divobj = newDivObj();
    if (!divobj.style.find(p => p.name == 'borderRadius'))
        divobj.style.push(newStyleProp('borderRadius', 50, '%'));
    let div = createDiv(divobj);
    document.getElementById("container").appendChild(div);
}

function newVLine() {
    let divobj = newDivObj();
    divobj.style.find(p => p.name == 'width').value = 0;
    if (!divobj.style.find(p => p.name == 'borderWidth'))
        divobj.style.push(newStyleProp('borderWidth', 2, 'px'));
    let div = createDiv(divobj);
    document.getElementById("container").appendChild(div);
}

function newHLine() {
    let divobj = newDivObj();
    divobj.style.find(p => p.name == 'height').value = 0;
    if (!divobj.style.find(p => p.name == 'borderWidth'))
        divobj.style.push(newStyleProp('borderWidth', 2, 'px'));
    let div = createDiv(divobj);
    document.getElementById("container").appendChild(div);
}

function createDiv(obj) {
    if (!obj) {
        return null;
    }
    let div = document.createElement("div");
    div.id = obj.id;
    div.draggable = true;
    div.ondragend = (ev) => captureDrop(ev, obj.id);
    div.onclick = (ev) => selectDiv(obj.id);
    applyStyle(div, obj.style);
    return div;
}

function exportData() {
    let area = document.getElementById('dataArea');
    let data = selectedDivsId.map(id => divList.find(o => o.id == id));
    area.value = JSON.stringify(data);
}

function importData() {
    let area = document.getElementById('dataArea');
    let data = area.value;
    let divs = JSON.parse(data);
    selectedDivsId.forEach(id => selectDiv(id));
    divs.forEach(divobj => {
        divobj.id = nextId();
        divList.push(divobj);
        selectedDivsId.push(divobj.id);
        let div = createDiv(divobj);
        div.style.backgroundColor = selectionColor;
        document.getElementById("container").appendChild(div);
    });
}

function captureDrop(evt, id) {
    evt.preventDefault();
    let div = document.getElementById(id);
    let width = div.offsetWidth;
    let heigth = div.offsetHeight;
    let x = evt.x - (width / 2);
    let y = evt.y - (heigth / 2);
    div.style.left = x + 'px';
    div.style.top = y + 'px';
    let obj = divList.find(o => o.id == id);
    obj.style.find(prop => prop.name == 'left').value = x;
    obj.style.find(prop => prop.name == 'top').value = y;
}

function move(direction) {
    selectedDivsId.forEach(id => moveDiv(direction, id));
}

function moveDiv(direction, id) {
    let obj = divList.find(o => o.id == id);
    let x = obj.style.find(prop => prop.name == 'left').value;
    let y = obj.style.find(prop => prop.name == 'top').value;
    let amount = Number.parseInt(document.getElementById('move-amount').value);
    switch (direction) {
        case 'right':
            x += amount;
            break;
        case 'left':
            x -= amount;
            break;
        case 'up':
            y -= amount;
            break;
        case 'down':
            y += amount;
    }
    let div = document.getElementById(id);
    div.style.left = x + 'px';
    div.style.top = y + 'px';
    obj.style.find(prop => prop.name == 'left').value = x;
    obj.style.find(prop => prop.name == 'top').value = y;
}

function getDocumentXY() {
    let container = document.getElementById("container").getBoundingClientRect();
    let body = document.body.getBoundingClientRect();
    let x = container.left - body.left;
    let y = container.top - body.top;
    return { x, y };
}

let cssProperties = [
    newCssProp('Width', 'width', 0, 'px', ['px', '%']),
    newCssProp('Height', 'height', 0, 'px', ['px', '%']),
    newCssProp('Layer', 'zIndex', 0),
    newCssProp('Rotate', 'rotate', 0, 'deg'),
    newCssProp('Border Radius', 'borderRadius', 0, '%', ['px', '%'], [],
        [
            'Top Left=borderTopLeftRadius',
            'Top Right=borderTopRightRadius',
            'Bottom Left=borderBottomLeftRadius',
            'Bottom Right=borderBottomRightRadius'
        ]),
    newCssProp('Border Width', 'borderWidth', 0, 'px', ['px'], [],
        [
            'Top=borderTopWidth',
            'Bottom=borderBottomWidth',
            'Left=borderLeftWidth',
            'Right=borderRightWidth'
        ]),
    newCssProp('Border Style', 'borderStyle', 'solid', '', ['px'], ['solid', 'dashed', 'dotted', 'double', 'groove'],
        [
            'Top=borderTopStyle',
            'Bottom=borderBottomStyle',
            'Left=borderLeftStyle',
            'Right=borderRightStyle'
        ])
];

let allCssProperties;

function getAllCssProps() {
    if (allCssProperties) {
        return allCssProperties;
    }
    let list = [];
    cssProperties.forEach(p => {
        list.push(p);
        if (!p.subprops) {
            return;
        }
        let subprops = getCssSubproperties(p);
        subprops.forEach(sp => list.push(sp));
    });
    allCssProperties = list;
    return list;
}

function getCssSubproperties(prop) {
    if (!prop || !prop.subprops) {
        return [];
    }
    return prop.subprops.map(name => {
        let label = name;
        if (name.includes('=')) {
            label = name.split('=')[0].trim();
            name = name.split('=')[1].trim();
        }
        return {
            label,
            name,
            value: prop.value,
            unity: prop.unity,
            units: prop.units,
            values: prop.values
        }
    });
}

function generatePropertyEditor() {
    let editor = document.getElementById('cssPropertyEditor');
    cssProperties.forEach(prop => editor.appendChild(generateEditorProperty(prop)));
}

function generateEditorProperty(prop) {
    if (!prop) {
        return null;
    }
    let main = document.createElement('div');
    main.id = 'propEditor_' + prop.name;
    main.className = "css-property";

    let title = document.createElement('div');
    title.className = "css-prop-label";
    main.appendChild(title);
    let label = document.createElement('label');
    label.innerText = prop.label;
    title.appendChild(label);

    let valuesDiv = document.createElement('div');
    valuesDiv.className = "css-prop-values";
    main.appendChild(valuesDiv);

    if (prop.values && prop.values.length > 0) {
        let select = newSelectElement(prop.values);
        select.id = main.id + "_selectValue";
        select.className = "css-prop-select-val";
        selectOption(select, prop.value);
        valuesDiv.appendChild(select);
        select.onchange = () => fireCssProperty(select.id, prop.name, 'select');
    } else {
        let input = document.createElement('input');
        input.id = main.id + "_inputValue";
        input.className = "css-prop-input-val";
        input.value = prop.value;
        valuesDiv.appendChild(input);
        input.onchange = () => fireCssProperty(input.id, prop.name, 'input');
        if (typeof prop.value == 'number') {
            input.type = 'number';
        }
    }
    if (prop.units && prop.units.length > 0) {
        let select = newSelectElement(prop.units);
        select.id = main.id + "_selectUnity";
        select.className = "css-prop-select-unt";
        selectOption(select, prop.unity);
        valuesDiv.appendChild(select);
        select.onchange = () => fireCssProperty(select.id, prop.name, 'select', true);
    } else if (prop.unity) {
        let input = document.createElement('input');
        input.id = main.id + "_inputUnity";
        input.className = "css-prop-input-unt";
        input.value = prop.unity;
        valuesDiv.appendChild(input);
        input.onchange = () => fireCssProperty(input.id, prop.name, 'input', true);
    }
    if (!prop.subprops || prop.subprops.length < 1) {
        return main;
    }
    let subprops = document.createElement('div');
    subprops.className = "css-subprops";
    main.appendChild(subprops);
    getCssSubproperties(prop).forEach(subprop => {
        let subpropdiv = generateEditorProperty(subprop);
        subprops.appendChild(subpropdiv);
    });
    return main;
}

function fireCssProperty(elmtId, name, type = 'input', unity = false) {
    if (!elmtId || !name) {
        return;
    }
    let elmt = document.getElementById(elmtId);
    let value;
    if (type == 'select') {
        value = getSelectedOption(elmt);
    } else {
        value = elmt.value;
    }
    selectedDivsId.forEach(id => {
        let obj = divList.find(o => o.id == id);
        if (!obj) {
            return;
        }
        let div = document.getElementById(id);
        if (!div) {
            return;
        }
        let prop = obj.style.find(p => p.name == name);
        if (!prop) {
            prop = { name };
            obj.style.push(prop);
            prop.unity = '';
            let editorProp = getAllCssProps().find(p => p.name == name);
            if (editorProp) {
                prop.unity = editorProp.unity;
            }
        }
        if (unity) {
            prop.unity = value;
            applyStyleProp(div, prop);
            return;
        }
        prop.value = value;
        applyStyleProp(div, prop);
    });
}

function setValuesOnCssEditor(style) {
    if (!style || !Array.isArray(style)) {
        return;
    }
    style.forEach(prop => {
        let editorProp = getAllCssProps().find(ep => prop.name == ep.name);
        if (!editorProp) {
            return;
        }
        let value = prop.value ? prop.value : editorProp.value;
        let unity = prop.unity ? prop.unity : editorProp.unity;
        let editorId = "propEditor_" + prop.name;
        if (editorProp.values && editorProp.values.length > 0) {
            let valueId = editorId + "_selectValue";
            let select = document.getElementById(valueId);
            selectOption(select, value);
        } else {
            let valueId = editorId + "_inputValue";
            let input = document.getElementById(valueId);
            if (input)
                input.value = value;
        }
        if (editorProp.units && editorProp.units.length > 0) {
            let unitId = editorId + "_selectUnity";
            let select = document.getElementById(unitId);
            selectOption(select, unity);
        } else {
            let unitId = editorId + "_inputUnity";
            let input = document.getElementById(unitId);
            if (input)
                input.value = unity;
        }
    });
}

let colors = ['rgb(0, 0, 0, 0)', 'black', 'white', 'gray', 'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'magenta'];

function generateColorTab() {
    let tab = document.getElementById('colorsTab');
    for (let i = 0; i < colors.length; i++) {
        tab.appendChild(generateColorTabItem(i, colors[i]));
    }
}

function generateColorTabItem(idx, color) {
    let div = newColorDiv(color, 20);
    div.onclick = (ev) => fireColor(idx);
    return div;
}

function fireColor(idx) {
    let color = colors[idx];
    let type = getSelectedOption(document.getElementById('colorType'));
    selectedDivsId.forEach(id => {
        let obj = divList.find(o => o.id == id);
        let prop = obj.style.find(p => p.name == type);
        if (!prop) {
            prop = {name: type, unity: ''};
            obj.style.push(prop);
        }
        prop.value = color;
        let div = document.getElementById(id);
        applyStyleProp(div, prop);
    });
}

function newColorDiv(color, size) {
    let div = document.createElement('button');
    div.style.width = size + 'px';
    div.style.height = size + 'px';
    div.style.backgroundColor = color;
    div.style.border = '1px solid black';
    div.style.borderRadius = '20%';
    div.className = 'color-div';
    return div;
}

function newSelectElement(options) {
    let select = document.createElement('select');
    options.forEach(opt => {
        let option = document.createElement('option');
        opt = typeof opt == 'string' ? { text: opt, value: opt } : opt;
        option.innerText = opt.text;
        option.value = opt.value;
        select.appendChild(option);
    });
    return select;
}

function selectOption(select, optValue) {
    if (!select) {
        return;
    }
    if (!optValue) {
        select.selectedIndex = -1;
        return;
    }
    for (let option of select.options) {
        if (option.value == optValue) {
            option.selected = 'selected';
        }
    }
}

function getSelectedOption(select) {
    if (!select) {
        return null;
    }
    let option = select.options[select.selectedIndex];
    if (!option) {
        return null;
    }
    return option.value;
}

function newCssProp(label, name, value, unity = '', units = [], values = [], subprops = []) {
    return { label, name, value, unity, units, values, subprops }
}

function newStyleProp(name, value, unity = '') {
    return { name, value, unity };
}

function applyStyle(div, props) {
    if (!props || !Array.isArray(props)) {
        return;
    }
    props.forEach(prop => applyStyleProp(div, prop));
}

function applyStyleProp(div, prop) {
    if (!div || !prop || !prop.name || !prop.value) {
        return;
    }
    div.style[prop.name] = prop.value + (prop.unity ? prop.unity : '');
}
