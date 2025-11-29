
function showToast(message, duration = 3000) { 
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const MAX_TOASTS = 3;
    const currentToasts = container.querySelectorAll('.toast');
    
    if (currentToasts.length >= MAX_TOASTS) {
        currentToasts[0].remove(); 
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('hide');
            toast.addEventListener('animationend', () => toast.remove());
        }
    }, duration);
}

function validateForm() {
    const input = document.getElementById("todoContent");
    if (input.value.trim() === "") {
        showToast("할 일을 입력해주세요! 🤔");
        input.focus();
        return false;
    }
    return true;
}

function deleteTodo(id) {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const item = document.querySelector(`li[data-id='${id}']`);
    
    if (item) {
        item.classList.add('removing'); 
    }

    fetch(`todoAction.jsp?action=delete&id=${id}`)
        .then(response => {
            if (response.ok) {
                setTimeout(() => {
                    if(item) item.remove();
                    showToast("삭제되었습니다. 🗑️");
                }, 400); 
            } else {
                showToast("삭제 실패! 다시 시도해주세요.");
                if(item) item.classList.remove('removing');
            }
        })
        .catch(err => {
            console.error(err);
            if(item) item.classList.remove('removing');
        });
}

function updateStatus(id, newStatus) {
    const nextStatus = newStatus === 'DONE' ? 'TODO' : 'DONE';
    
    const item = document.querySelector(`li[data-id='${id}']`);
    const btn = item ? item.querySelector('.chk-btn') : null;
    if (item) {
        item.classList.toggle('done', newStatus === 'DONE');

        if(btn) {
            btn.innerHTML = newStatus === 'DONE' ? '↩' : '✔';
            btn.setAttribute('onclick', `updateStatus(${id}, '${nextStatus}')`);
        }
    }

    fetch(`todoAction.jsp?action=updateStatus&id=${id}&status=${newStatus}`)
        .then(response => {
            if(response.ok) {
                showToast(newStatus === 'DONE' ? "완료했어요! 🎉" : "다시 할 일로! 💪");
            } else {
                if(item) {
                    item.classList.toggle('done', newStatus !== 'DONE'); 
                    if(btn) {
                        btn.innerHTML = newStatus === 'DONE' ? '✔' : '↩';
                        btn.setAttribute('onclick', `updateStatus(${id}, '${newStatus}')`);
                    }
                    showToast("상태 변경 실패 😭");
                }
            }
        })
        .catch(err => {
            console.error(err);
            if(item) {
                item.classList.toggle('done', newStatus !== 'DONE');
                showToast("서버 오류가 발생했습니다.");
            }
        });
}

function editTodo(id, oldContent) {
    let newContent = prompt("수정할 내용을 입력하세요:", oldContent);
    
    if (newContent === null) return; 
    if (newContent.trim() === "") {
        showToast("내용을 입력해야 합니다.");
        return;
    }

    const item = document.querySelector(`li[data-id='${id}']`);
    const textSpan = item.querySelector('.content-text');

    if(textSpan) textSpan.innerText = newContent;

    fetch('todoAction.jsp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: `action=edit&id=${id}&content=${encodeURIComponent(newContent)}`
    }).then(res => {
        if(res.ok) {
            showToast("수정되었습니다. ✏️");
            const editBtn = item.querySelector('.edit-btn');
            if(editBtn) editBtn.setAttribute('onclick', `editTodo(${id}, '${newContent.replace(/'/g, "\\'")}')`);
        }
    });
}

function toggleMemo(id) {
    const box = document.getElementById('memo-box-' + id);
    if (!box) return;
    
    if (box.style.display === 'none' || box.style.display === '') {
        box.style.display = 'block';
        const textarea = box.querySelector('textarea');
        if(textarea) textarea.focus();
    } else {
        box.style.display = 'none';
    }
}

function saveMemo(id) {
    const memoText = document.getElementById('memo-text-' + id).value;

    fetch('todoAction.jsp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: 'action=updateMemo&id=' + id + '&memo=' + encodeURIComponent(memoText)
    })
    .then(response => {
        if (response.ok) {
            showToast("메모가 저장되었습니다. 💾");
        } else {
            showToast("저장 실패!");
        }
    });
}

const list = document.getElementById('todo-list');
let draggedItem = null;

if (list) {
    list.addEventListener('dragstart', (e) => {
        const target = e.target.closest('li'); 
        if (!target) return;
        draggedItem = target;
        setTimeout(() => target.classList.add('dragging'), 0);
    });

    list.addEventListener('dragend', (e) => {
        const target = e.target.closest('li');
        if (target) target.classList.remove('dragging');
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
        showToast("순서가 변경되었습니다! ⇅");
    }).catch(error => {
        console.error("Error updating order:", error);
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
        showToast("삭제할 완료된 항목이 없어요.");
        return;
    }

    if (!confirm(`완료된 할 일 ${doneItems.length}개를 모두 삭제하시겠습니까?`)) return;

    doneItems.forEach(item => item.classList.add('removing'));

    fetch('todoAction.jsp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: 'action=clearDone'
    })
    .then(response => {
        if (response.ok) {
            setTimeout(() => {
                doneItems.forEach(item => item.remove());
                showToast("완료된 항목을 정리했습니다! 🧹");
            }, 400);
        } else {
            showToast("오류가 발생했습니다.");
            doneItems.forEach(item => item.classList.remove('removing'));
        }
    });
}

const themeCheckbox = document.getElementById('toggle-dark');
const body = document.body; 

if (localStorage.getItem('darkMode') === 'true') {
    body.classList.add('dark');
    if (themeCheckbox) themeCheckbox.checked = true;
}

if (themeCheckbox) {
    themeCheckbox.addEventListener('change', () => {
        body.classList.toggle('dark', themeCheckbox.checked);
        localStorage.setItem('darkMode', themeCheckbox.checked);
        showToast(themeCheckbox.checked ? "다크 모드 ON 🌙" : "라이트 모드 ON ☀️");
    });
} 

document.addEventListener('click', function(e) {
    const memoBoxes = document.querySelectorAll('.memo-box');
    memoBoxes.forEach(box => {
        if (box.style.display === 'block') {
            const parentLi = box.closest('li');
            const toggleBtn = parentLi ? parentLi.querySelector('.memo-btn') : null;
            if (!box.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) {
                box.style.display = 'none';
            }
        }
    }); 
});