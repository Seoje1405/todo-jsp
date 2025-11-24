// 1. 빈값 체크 (유효성 검사)
function validateForm() {
    const input = document.getElementById("todoContent");
    if (input.value.trim() === "") {
        alert("할 일을 입력해주세요!");
        input.focus();
        return false;
    }
    return true;
}

// 2. 삭제 및 상태 업데이트 (GET 방식으로 페이지 이동)
function deleteTodo(id) {
    if(confirm("정말 삭제하시겠습니까?")) {
        location.href = "todoAction.jsp?action=delete&id=" + id;
    }
}

function updateStatus(id, status) {
    location.href = "todoAction.jsp?action=updateStatus&id=" + id + "&status=" + status;
}

// 3. 드래그 앤 드롭 기능 구현
const list = document.getElementById('todo-list');
let draggedItem = null;

list.addEventListener('dragstart', (e) => {
    draggedItem = e.target;
    e.target.classList.add('dragging'); // 스타일 적용
});

list.addEventListener('dragend', (e) => {
    e.target.classList.remove('dragging');
    draggedItem = null;
    saveOrder(); // 순서 변경 후 DB 저장
});

list.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(list, e.clientY);
    if (afterElement == null) {
        list.appendChild(draggedItem);
    } else {
        list.insertBefore(draggedItem, afterElement);
    }
});

// 마우스 위치에 따라 어느 요소 앞에 넣을지 계산
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

// 4. 변경된 순서 DB 저장 (AJAX 사용)
function saveOrder() {
    const items = list.querySelectorAll('li');
    const ids = [];
    items.forEach(item => ids.push(item.getAttribute('data-id')));

    // fetch API를 사용하여 비동기 전송
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

// js/script.js 에 추가

function editTodo(id, oldContent) {
    // 사용자에게 입력받기
    let newContent = prompt("수정할 내용을 입력하세요:", oldContent);
    
    // 취소하거나 내용이 없으면 실행 안 함
    if (newContent === null) return; 
    if (newContent.trim() === "") {
        alert("내용을 입력해야 합니다.");
        return;
    }

    // 수정 요청 보내기 (GET 방식)
    location.href = "todoAction.jsp?action=edit&id=" + id + "&content=" + encodeURIComponent(newContent);
}
// js/script.js 에 추가

// 1. 메모 박스 토글 (보이기/숨기기)
function toggleMemo(id) {
    const box = document.getElementById('memo-box-' + id);
    if (box.style.display === 'none') {
        box.style.display = 'block';
    } else {
        box.style.display = 'none';
    }
}

// 2. 메모 저장 (AJAX)
function saveMemo(id) {
    const memoText = document.getElementById('memo-text-' + id).value;

    // fetch API로 비동기 저장 요청
    fetch('todoAction.jsp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        // action=updateMemo, id, memo 데이터 전송
        body: 'action=updateMemo&id=' + id + '&memo=' + encodeURIComponent(memoText)
    })
    .then(response => {
        if(response.ok) {
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

