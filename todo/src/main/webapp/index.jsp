<%@ page import="java.sql.*, todo.DBConnection" %>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<%
    String userID = (String) session.getAttribute("userID");
    if (userID == null) {
        response.sendRedirect("login.jsp");
        return; 
    } 
%>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>My Todo List</title>
    <link rel="stylesheet" href="css/style.css">
</head> 
<body>
    <div class="theme-toggle">
        <input type="checkbox" id="toggle-dark"> 
        <label class="toggle-label" for="toggle-dark"></label>
    </div>

    <div class="container">
        <div class="header-info">
            <span>Hello, <%= userID %>!</span>
            <a href="logoutAction.jsp" class="logout-btn">Logout</a>
        </div>

        <h2>To‑Do List</h2>

        <form action="todoAction.jsp" method="post" onsubmit="return validateForm()">
            <input type="hidden" name="action" value="insert">
            <div class="input-group">
                <input type="text" id="todoContent" name="content" placeholder="할 일을 입력하세요..." autofocus>
                <button type="submit">Add</button>
            </div>
        </form>
        
        <div class="control-bar">
            <div class="search-box">
                <span class="search-icon">🔍</span>
                <input type="text" id="searchInput" onkeyup="filterTodos()" placeholder="검색어를 입력하세요...">
            </div>
            <button class="clear-btn" onclick="clearCompleted()">🗑️ 완료 삭제</button>
        </div>

        <ul id="todo-list">
            <%
                try (Connection conn = DBConnection.getConnection();
                     PreparedStatement pstmt = conn.prepareStatement("SELECT * FROM todos WHERE username=? ORDER BY seq ASC, id ASC")) {

                    pstmt.setString(1, userID);
                    ResultSet rs = pstmt.executeQuery();

                    while (rs.next()) {
                        int id = rs.getInt("id");
                        String content = rs.getString("content");
                        String status = rs.getString("status");
                        String memo = rs.getString("memo");
                        if (memo == null) memo = "";
                        boolean isDone = "DONE".equals(status);
            %>

            <li class="<%= isDone ? "done" : "" %>" draggable="true" data-id="<%= id %>">
                <div class="todo-main">
                    <span class="content-text"><%= content %></span>
                    <div class="btn-group">
                        <button class="action-btn memo-btn" onclick="toggleMemo(<%= id %>)">📝</button>
                        <button class="action-btn edit-btn" onclick="editTodo(<%= id %>, '<%= content.replace("'", "\\'") %>')">✎</button>
                        <button class="action-btn chk-btn" onclick="updateStatus(<%= id %>, '<%= isDone ? "TODO" : "DONE" %>')">
                            <%= isDone ? "↩" : "✔" %>
                        </button>
                        <button class="action-btn del-btn" onclick="deleteTodo(<%= id %>)">✖</button>
                    </div>
                </div>

                <div id="memo-box-<%= id %>" class="memo-box" style="display:none;">
                    <textarea id="memo-text-<%= id %>" placeholder="세부 메모를 입력하세요..."><%= memo %></textarea>
                    <button class="save-memo-btn" onclick="saveMemo(<%= id %>)">메모 저장</button>
                </div>
            </li> 

            <% 
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            %> 
        </ul>
    </div>

<script src="js/script.js"></script> 
    
    <script>
        function getParam(name) {
            return new URLSearchParams(window.location.search).get(name);
        }

        window.addEventListener('load', function() {
            const msg = getParam('msg');

            if (msg === 'login') {
                showToast("환영합니다! 오늘도 화이팅! 🔥", 2000);
                
                history.replaceState({}, null, location.pathname);
            }
        });
    </script></body>
</html>