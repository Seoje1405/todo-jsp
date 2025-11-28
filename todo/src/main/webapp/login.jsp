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
            <div class="input-group flex-col"> 
<input type="text" name="username" placeholder="Username" required autocomplete="username" autofocus>
<input type="password" name="password" placeholder="Password" required autocomplete="current-password">
                <button type="submit">Login</button>
                <button type="button" onclick="location.href='register.jsp'" class="btn-secondary mt-5">회원가입</button>
            </div>
        </form>
    </div> 

<script src="js/script.js"></script>
    <script>
        // URL 파라미터 확인 함수 (index.jsp와 동일)
        function getParam(name) {
            return new URLSearchParams(window.location.search).get(name);
        }

        window.addEventListener('load', function() {
            // 1. 로그인 에러 처리 (기존 코드)
            <% if(hasError) { %>
                showToast("로그인 정보를 확인해주세요! 😅");
            <% } %>

            // 2. 로그아웃 메시지 처리 (추가된 코드)
            const msg = getParam('msg');
            if (msg === 'logout') {
                showToast("로그아웃 되었습니다. 👋");
                
                // URL 주소 정리
                history.replaceState({}, null, location.pathname);
            }
        });
    </script>
</body>
</html>