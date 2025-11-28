<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>회원가입</title>
    <link rel="stylesheet" href="css/style.css">
    <script>
        function validateRegister() {
            var form = document.regForm;
            if(!form.username.value || !form.password.value) {
                showToast("아이디와 비밀번호를 입력해주세요! 🤔"); 
                return false;
            }
            if(form.password.value != form.passConfirm.value) {
                showToast("비밀번호가 서로 달라요! 🙅‍♂️");
                return false;
            }
            return true;
        } 
    </script>
</head>
<body>
    <div class="container">
        <h2>Join Us</h2>
        <form name="regForm" action="registerAction.jsp" method="post" onsubmit="return validateRegister()">
            <div class="input-group flex-col">
                <input type="text" name="username" placeholder="사용할 아이디" required>
                <input type="password" name="password" placeholder="비밀번호" required>
                <input type="password" name="passConfirm" placeholder="비밀번호 확인" required>
                
                <button type="submit">가입하기</button>
                <button type="button" onclick="location.href='login.jsp'" class="btn-gray mt-5">돌아가기</button>
            </div>
        </form>
    </div>

    <script src="js/script.js"></script>
</body>
</html>