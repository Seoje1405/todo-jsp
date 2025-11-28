
function showToast(message, duration = 3000) { // duration: 기본값 3000ms (3초)
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

// 할 일 삭제 (AJAX + 애니메이션)
function deleteTodo(id) {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const item = document.querySelector(`li[data-id='${id}']`);
    
    // UI에서 먼저 부드럽게 사라지게 처리 (Optimistic UI)
    if (item) {
        item.classList.add('removing'); 
    }

    fetch(`todoAction.jsp?action=delete&id=${id}`)
        .then(response => {
            if (response.ok) {
                setTimeout(() => {
                    if(item) item.remove();
                    showToast("삭제되었습니다. 🗑️");
                }, 400); // 애니메이션 시간 대기
            } else {
                showToast("삭제 실패! 다시 시도해주세요.");
                if(item) item.classList.remove('removing'); // 실패 시 복구
            }
        })
        .catch(err => {
            console.error(err);
            if(item) item.classList.remove('removing');
        });
}

// 상태 업데이트 (수정됨: 인자로 받은 status를 그대로 적용)
function updateStatus(id, newStatus) {
    // newStatus: 'DONE' (완료하려는 경우) 또는 'TODO' (취소하려는 경우)
    // nextStatus: 다음 클릭 시 보낼 상태 (현재와 반대)
    const nextStatus = newStatus === 'DONE' ? 'TODO' : 'DONE';
    
    const item = document.querySelector(`li[data-id='${id}']`);
    const btn = item ? item.querySelector('.chk-btn') : null;
    
    // 1. 즉시 UI 업데이트 (Optimistic UI)
    if (item) {
        // newStatus가 'DONE'이면 done 클래스 추가, 아니면 제거
        item.classList.toggle('done', newStatus === 'DONE');

        if(btn) {
            // 완료 상태가 되면 '되돌리기(↩)' 아이콘, 아니면 '체크(✔)' 아이콘 표시
            btn.innerHTML = newStatus === 'DONE' ? '↩' : '✔';
            // 다음 클릭을 위해 onclick 속성 업데이트
            btn.setAttribute('onclick', `updateStatus(${id}, '${nextStatus}')`);
        }
    }

    // 2. 서버에 비동기 요청
    fetch(`todoAction.jsp?action=updateStatus&id=${id}&status=${newStatus}`)
        .then(response => {
            if(response.ok) {
                showToast(newStatus === 'DONE' ? "완료했어요! 🎉" : "다시 할 일로! 💪");
            } else {
                // 실패 시 롤백 (UI 원상복구)
                if(item) {
                    item.classList.toggle('done', newStatus !== 'DONE'); // 원래대로
                    if(btn) {
                        btn.innerHTML = newStatus === 'DONE' ? '✔' : '↩'; // 아이콘 복구
                        btn.setAttribute('onclick', `updateStatus(${id}, '${newStatus}')`); // 클릭 이벤트 복구
                    }
                    showToast("상태 변경 실패 😭");
                }
            }
        })
        .catch(err => {
            console.error(err);
            // 에러 발생 시에도 롤백 필요
            if(item) {
                item.classList.toggle('done', newStatus !== 'DONE');
                showToast("서버 오류가 발생했습니다.");
            }
        });
}

// 할 일 수정
function editTodo(id, oldContent) {
    // 프롬프트 대신 커스텀 모달을 쓰면 더 좋지만, 간단히 구현하기 위해 프롬프트 사용
    let newContent = prompt("수정할 내용을 입력하세요:", oldContent);
    
    if (newContent === null) return; 
    if (newContent.trim() === "") {
        showToast("내용을 입력해야 합니다.");
        return;
    }

    const item = document.querySelector(`li[data-id='${id}']`);
    const textSpan = item.querySelector('.content-text');

    // UI 즉시 업데이트
    if(textSpan) textSpan.innerText = newContent;

    fetch('todoAction.jsp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: `action=edit&id=${id}&content=${encodeURIComponent(newContent)}`
    }).then(res => {
        if(res.ok) {
            showToast("수정되었습니다. ✏️");
            // onclick 업데이트
            const editBtn = item.querySelector('.edit-btn');
            if(editBtn) editBtn.setAttribute('onclick', `editTodo(${id}, '${newContent.replace(/'/g, "\\'")}')`);
        }
    });
}

// 메모 토글
function toggleMemo(id) {
    const box = document.getElementById('memo-box-' + id);
    if (!box) return;
    
    if (box.style.display === 'none' || box.style.display === '') {
        box.style.display = 'block';
        // 텍스트영역 포커스
        const textarea = box.querySelector('textarea');
        if(textarea) textarea.focus();
    } else {
        box.style.display = 'none';
    }
}

// 메모 저장
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
            // 메모 박스 닫기 (선택 사항)
            // document.getElementById('memo-box-' + id).style.display = 'none';
        } else {
            showToast("저장 실패!");
        }
    });
}

// 드래그 앤 드롭 정렬 (기존 코드 유지)
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
        // [추가] 순서 변경 완료 토스트
        showToast("순서가 변경되었습니다! ⇅");
    }).catch(error => {
        console.error("Error updating order:", error);
    });
}

// 필터링 기능
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

// 완료 항목 삭제 (AJAX)
function clearCompleted() {
    const doneItems = document.querySelectorAll('#todo-list li.done');
    if (doneItems.length === 0) {
        showToast("삭제할 완료된 항목이 없어요.");
        return;
    }

    if (!confirm(`완료된 할 일 ${doneItems.length}개를 모두 삭제하시겠습니까?`)) return;

    // UI 먼저 삭제
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

// 테마 설정 및 외부 클릭 감지
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

// 메모 박스 외부 클릭 시 닫기
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