<%@ page import="java.sql.*, todo.DBConnection" %>
<%@ page errorPage="error.jsp" %> <!-- 예외 처리 -->
<%
    String user = request.getParameter("username");
    String pass = request.getParameter("password");

    // 빈값 체크 (서버 사이드)
    if(user == null || user.trim().isEmpty() || pass == null || pass.trim().isEmpty()){
        throw new Exception("아이디와 비밀번호를 입력해주세요.");
    }

    Connection conn = DBConnection.getConnection();
    String sql = "SELECT * FROM users WHERE username=? AND password=?";
    PreparedStatement pstmt = conn.prepareStatement(sql);
    pstmt.setString(1, user);
    pstmt.setString(2, pass);
    ResultSet rs = pstmt.executeQuery();

    if(rs.next()) {
        session.setAttribute("userID", user);
        response.sendRedirect("index.jsp");
    } else {
        // [수정된 부분]
        // 경고창(alert) 대신, 에러 표시를 위해 다시 로그인 페이지로 보냄
        response.sendRedirect("login.jsp?error=true");
    }
    conn.close();
%>
