<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%
    String error = request.getParameter("error");
    boolean hasError = "true".equals(error);
%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Todo Login</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="container <%= hasError ? "shake" : "" %>">
        <h2>Login</h2>
        
        <% if(hasError) { %>
            <div class="error-msg">
                ⚠ 아이디 또는 비밀번호가 일치하지 않습니다.
            </div>
        <% } %>

        <form action="loginAction.jsp" method="post">
            <div class="input-group" style="flex-direction: column;">
                <input type="text" name="username" placeholder="Username" required>
                <input type="password" name="password" placeholder="Password" required>
                <button type="submit">Login</button>
                <button type="button" onclick="location.href='register.jsp'" style="background-color: #0984e3; margin-top:5px;">회원가입</button>
            </div>
        </form>
    </div>
</body>
</html>
