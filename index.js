let path = ipcRenderer.homeDir();
let header;
let header1;
let header2;

function load() {
    header = document.getElementById('header');
    header1 = document.getElementById('header1');
    header2 = document.getElementById('header2');
    header1.innerHTML = path;
    ipcRenderer.send('file:upload', path);

    function buildItem(i) {
        if (i.type == 'file')
            return `<div onclick="openn('${i.name}')"><img width="20" src="file.svg"/>${i.name.split('.')[0]}</div>`;
        return `<div onclick="go('${i.name}')"><img width="20" src="dir.svg"/>${i.name}</div>`;
    }

    ipcRenderer.on('upload:complete', function (a, b, c) {
        document.getElementById('explorer').innerHTML = b.map(i => buildItem(i)).join('')
    })
}

function go(path) {
    header2.innerHTML += `<span>/</span><span onclick="jump('${header.textContent}/${path}')">${path}</span>`;
    ipcRenderer.send('go', header.textContent);
}

function jump(newPath) {
    const newParts = newPath.split('/');
    header2.innerHTML = '';
    let temp = path;
    header1.innerHTML = path;
    for (let i = path.split('/').length; i < newParts.length; i++) {
        temp = path += `/${newParts[i]}`;
        header2.innerHTML += `<span>/</span><span onclick="jump('${temp}')">${newParts[i]}</span>`;
    }
    ipcRenderer.send('go', header.textContent);
}

function openn(path) {
    ipcRenderer.send('openn', `${header.textContent}/${path}`)
}


/*let findInPage = new FindInPage(remote.getCurrentWebContents(), {
    preload: true,
    offsetTop: 6,
    offsetRight: 10
})*/

// let findInPage = new FindInPage(remote.getCurrentWebContents(), {
//   boxBgColor: '#333',
//   boxShadowColor: '#000',
//   inputColor: '#aaa',
//   inputBgColor: '#222',
//   inputFocusColor: '#555',
//   textColor: '#aaa',
//   textHoverBgColor: '#555',
//   caseSelectedColor: '#555',
//   offsetTop: 8,
//   offsetRight: 12
// })

ipcRenderer.on('on-find', (e, args) => {
    findInPage.openFindWindow()
})

function onChange () {
    const titleDom = document.querySelector('#title')
    titleDom.innerHTML = '标题已被修改'
    setTimeout(() => {
        findInPage.update()
    }, 20)
}