function validateForm() {
    const input = document.getElementById("todoContent");
    if (input.value.trim() === "") {
        alert("할 일을 입력해주세요!");
        input.focus();
        return false;
    }
    return true;
}

function deleteTodo(id) {
    if (confirm("정말 삭제하시겠습니까?")) {
        location.href = "todoAction.jsp?action=delete&id=" + id;
    }
}

function updateStatus(id, status) {
    location.href = "todoAction.jsp?action=updateStatus&id=" + id + "&status=" + status;
}

const list = document.getElementById('todo-list');
let draggedItem = null;

if (list) {
    list.addEventListener('dragstart', (e) => {
        const target = e.target.closest('li'); 
        if (!target) return;

        draggedItem = target;
        
        setTimeout(() => {
            target.classList.add('dragging');
        }, 0);
    });

    list.addEventListener('dragend', (e) => {
        const target = e.target.closest('li');
        if (target) {
            target.classList.remove('dragging');
        }
        draggedItem = null;
        saveOrder();
    });

    list.addEventListener('dragover', (e) => {
        e.preventDefault(); 
        const afterElement = getDragAfterElement(list, e.clientY);
        const dragging = document.querySelector('.dragging');
        
        if (dragging) {
            if (afterElement == null) {
                list.appendChild(dragging);
            } else {
                list.insertBefore(dragging, afterElement);
            }
        }
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function saveOrder() {
    if (!list) return;
    const items = list.querySelectorAll('li');
    const ids = [];
    items.forEach(item => ids.push(item.getAttribute('data-id')));

    fetch('todoAction.jsp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: 'action=reorder&' + ids.map(id => 'ids[]=' + id).join('&')
    }).then(response => {
        console.log("Order updated");
    }).catch(error => {
        console.error("Error updating order:", error);
    });
}

function editTodo(id, oldContent) {
    let newContent = prompt("수정할 내용을 입력하세요:", oldContent);
    
    if (newContent === null) return; 
    if (newContent.trim() === "") {
        alert("내용을 입력해야 합니다.");
        return;
    }

    location.href = "todoAction.jsp?action=edit&id=" + id + "&content=" + encodeURIComponent(newContent);
}

function toggleMemo(id) {
    const box = document.getElementById('memo-box-' + id);
    if (!box) return;
    box.style.display = (box.style.display === 'none' || box.style.display === '') ? 'block' : 'none';
}

function saveMemo(id) {
    const memoText = document.getElementById('memo-text-' + id).value;

    fetch('todoAction.jsp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: 'action=updateMemo&id=' + id + '&memo=' + encodeURIComponent(memoText)
    })
        .then(response => {
            if (response.ok) {
                alert("메모가 저장되었습니다.");
            } else {
                alert("저장 실패!");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("오류가 발생했습니다.");
        });
}

function filterTodos() {
    const searchInput = document.getElementById('searchInput');
    const filter = searchInput.value.toLowerCase(); 
    const listItems = document.querySelectorAll('#todo-list li');

    listItems.forEach((item) => {
        const text = item.querySelector('.content-text').innerText.toLowerCase();
        if (text.includes(filter)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function clearCompleted() {
    const doneItems = document.querySelectorAll('#todo-list li.done');
    if (doneItems.length === 0) {
        alert("삭제할 완료된 항목이 없습니다.");
        return;
    }

    if (!confirm(`완료된 할 일 ${doneItems.length}개를 모두 삭제하시겠습니까?`)) {
        return;
    }

    fetch('todoAction.jsp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: 'action=clearDone'
    })
    .then(response => {
        if (response.ok) {
            location.reload(); 
        } else {
            alert("삭제 중 오류가 발생했습니다.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

const themeCheckbox = document.getElementById('toggle-dark');
const body = document.body; 

if (localStorage.getItem('darkMode') === 'true') {
    body.classList.add('dark');
    if (themeCheckbox) themeCheckbox.checked = true;
} else {
    body.classList.remove('dark');
}

if (themeCheckbox) {
    themeCheckbox.addEventListener('change', () => {
        body.classList.toggle('dark', themeCheckbox.checked);
        localStorage.setItem('darkMode', themeCheckbox.checked);
    });
}

const searchInputGlobal = document.getElementById('searchInput');
const container = document.querySelector('.container');

if (searchInputGlobal && container) {
    searchInputGlobal.addEventListener('focus', () => {
        const rect = container.getBoundingClientRect();
        
        const bodyStyle = window.getComputedStyle(document.body);
        const paddingTop = parseFloat(bodyStyle.paddingTop);

        const targetMargin = rect.top - paddingTop;

        if (targetMargin > 0) {
            container.style.marginTop = targetMargin + 'px';
            body.style.alignItems = 'flex-start';
        }
    });

    searchInputGlobal.addEventListener('blur', () => {
        if (searchInputGlobal.value.trim() === '') {
            container.style.marginTop = '';
            body.style.alignItems = '';
        }
    });
}