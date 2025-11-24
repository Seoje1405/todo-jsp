<%@ page import="java.sql.*, todo.DBConnection" %>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!-- 세션 체크 -->
<%
    String userID = (String) session.getAttribute("userID");
    if(userID == null) {
        response.sendRedirect("login.jsp");
        return;
    }
%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>My Todo List</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="container">
        <div class="header-info">
            <span>Hello, <%= userID %>!</span>
            <a href="logoutAction.jsp" class="logout-btn">Logout</a>
        </div>
        <h2>To-Do List</h2>
        
        <!-- 입력 폼 -->
        <form action="todoAction.jsp" method="post" onsubmit="return validateForm()">
            <input type="hidden" name="action" value="insert">
            <div class="input-group">
                <input type="text" id="todoContent" name="content" placeholder="할 일을 입력하세요...">
                <button type="submit">Add</button>
            </div>
        </form>

        <!-- 목록 (드래그 앤 드롭 영역) -->
        <ul id="todo-list">
            <%
                Connection conn = DBConnection.getConnection();
                // 순서(seq)대로 정렬하여 조회
                String sql = "SELECT * FROM todos WHERE username=? ORDER BY seq ASC, id ASC";
                PreparedStatement pstmt = conn.prepareStatement(sql);
                pstmt.setString(1, userID);
                ResultSet rs = pstmt.executeQuery();

                while(rs.next()) {
                    int id = rs.getInt("id");
                    String content = rs.getString("content");
                    String status = rs.getString("status");
                    String memo = rs.getString("memo"); // 메모 가져오기
                    if(memo == null) memo = "";         // null 방지
                    boolean isDone = "DONE".equals(status);
            %>
            <li class="<%= isDone ? "done" : "" %>" draggable="true" data-id="<%= id %>">
                <div class="todo-main">
                    <span class="content-text"><%= content %></span>
                    <div class="btn-group">
                         <!-- [추가] 메모 토글 버튼 -->
                        <button class="action-btn memo-btn" onclick="toggleMemo(<%= id %>)">📝</button>
                        <button class="action-btn edit-btn" onclick="editTodo(<%= id %>, '<%= content %>')">✎</button>
                        <button class="action-btn chk-btn" onclick="updateStatus(<%= id %>, '<%= isDone ? "TODO" : "DONE" %>')">
                            <%= isDone ? "↩" : "✔" %>
                        </button>
                        <button class="action-btn del-btn" onclick="deleteTodo(<%= id %>)">✖</button>
                    </div>
                </div>
                
                <!-- [추가] 메모 입력 영역 (평소엔 숨김) -->
                <div id="memo-box-<%= id %>" class="memo-box" style="display: none;">
                    <textarea id="memo-text-<%= id %>" placeholder="세부 메모를 입력하세요..."><%= memo %></textarea>
                    <button class="save-memo-btn" onclick="saveMemo(<%= id %>)">메모 저장</button>
                </div>
            </li>

            <%
                }
                conn.close();
            %>
        </ul>
    </div>

    <script src="js/script.js"></script>
</body>
</html>
