const key_sequence = [];
const save_delay = 60000;
let content_updated = false;
let save_timer = null;
let editor = null;
let toolbar = null;


let last_control_press_time = 0;
document.addEventListener('keydown', function (event) {
    if (event.key === 'Control') {
        if (event.timeStamp - last_control_press_time < 300) {
            switchEditingState();
        }
        last_control_press_time = event.timeStamp;
    }
});

function switchEditingState() {
    const editButton = document.getElementById('edit-button');
    const isEditing = editButton.classList.toggle('on-editing');
    if (isEditing) {
        save_timer = setTimeout(() => {
            if (content_updated) {
                saveContent()
            }
        }, save_delay)
        editor.enable()
    } else {
        clearTimeout(save_timer);
        if (content_updated) {
            saveContent()
        }
        editor.disable()
    }
}

function createPopMenu() {
    // 创建弹出菜单容器
    const popMenu = document.createElement('div');
    popMenu.id = 'title-bar-pop-menu';
    popMenu.style.cssText = `
        position: absolute;
        top: 60px;
        right: 10px;
        background-color: white;
        border: 1px solid #ccc;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        min-width: 150px;
    `;

    // 添加菜单选项
    const menuOptions = [
        { id: 'open-file', text: '打开文件' },
        { id: 'save-file', text: '保存文件' }
    ];

    menuOptions.forEach(option => {
        const menuItem = document.createElement('div');
        menuItem.id = option.id;
        menuItem.textContent = option.text;
        menuItem.style.cssText = `
            padding: 10px 15px;
            cursor: pointer;
            font-size: 14px;
            color: #333;
        `;

        // 添加悬停效果
        menuItem.addEventListener('mouseenter', function () {
            this.style.backgroundColor = '#f0f0f0';
        });
        menuItem.addEventListener('mouseleave', function () {
            this.style.backgroundColor = 'white';
        });

        // 添加点击事件
        menuItem.addEventListener('click', function () {
            if (option.id === 'open-file') {
                openFile();
            } else if (option.id === 'save-file') {
                saveFile();
            }
            // 关闭菜单
            popMenu.remove();
        });

        popMenu.appendChild(menuItem);
    });

    // 添加到页面
    document.body.appendChild(popMenu);

    // 点击其他地方关闭菜单
    document.addEventListener('click', function closeMenu(event) {
        if (!popMenu.contains(event.target) && event.target.id !== 'title-bar-menu-button') {
            popMenu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
}

function openFile() {
    // 创建文件输入框
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.html';
    fileInput.click();

    fileInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const fileContent = e.target.result;
                editor.setHtml(fileContent);
                content_updated = true;
                console.log('File opened successfully');
            };
            reader.readAsText(file);
        }
    });
}

function saveFile() {
    // 先保存到服务器
    const htmlContent = editor.getHtml();
    if (content_updated) {
        saveContent()
    }
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edit_content.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    content_updated = false;
    console.log('File saved successfully');

}

window.addEventListener('DOMContentLoaded', function () {
    fetch('/get_content')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                editor.setHtml(data.content)
            } else {
                console.error('Failed to load content:', data.message)
            }
        })
        .catch(error => {
            console.error('Error fetching content:', error)
        })

    // 为菜单按钮添加点击事件
    const menuButton = document.getElementById('title-bar-menu-button');
    if (menuButton) {
        menuButton.addEventListener('click', function (event) {
            event.stopPropagation();
            // 检查是否已有菜单，如果有则移除
            const existingMenu = document.getElementById('title-bar-pop-menu');
            if (existingMenu) {
                existingMenu.remove();
            } else {
                createPopMenu();
            }
        });
    }

})

function saveContent() {
    const html = editor.getHtml()
    content_updated = false;
    fetch('/save_content', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: html }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Content saved successfully')
            } else {
                console.error('Failed to save content:', data.message)
            }
        })
        .catch(error => {
            console.error('Error saving content:', error)
        })
}