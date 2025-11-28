<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isErrorPage="true"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Error</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="container" style="text-align: center;">
        <h2 style="color: red;">오류가 발생했습니다!</h2>
        <p>
            <strong>메시지:</strong> <%= exception.getMessage() %>
        </p>
        <button onclick="history.back()">돌아가기</button>
    </div>
</body>
</html>
