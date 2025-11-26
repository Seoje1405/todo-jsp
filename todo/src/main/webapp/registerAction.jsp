<%@ page import="java.sql.*, todo.DBConnection" %>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%
    request.setCharacterEncoding("UTF-8");
    String user = request.getParameter("username");
    String pass = request.getParameter("password");

    Connection conn = null;
    PreparedStatement pstmt = null;
    ResultSet rs = null;

    try {
        conn = DBConnection.getConnection();
        
        // 아이디 중복 체크
        String sqlCheck = "SELECT username FROM users WHERE username=?";
        pstmt = conn.prepareStatement(sqlCheck);
        pstmt.setString(1, user);
        rs = pstmt.executeQuery();

        if(rs.next()) {
            out.println("<script>alert('이미 존재하는 아이디입니다.'); history.back();</script>");
        } else {
            // 가입 처리
            String sqlInsert = "INSERT INTO users(username, password) VALUES(?, ?)";
            // 이전 pstmt 닫기
            pstmt.close(); 
            
            pstmt = conn.prepareStatement(sqlInsert);
            pstmt.setString(1, user);
            pstmt.setString(2, pass);
            pstmt.executeUpdate();

            out.println("<script>alert('가입 성공! 로그인해주세요.'); location.href='login.jsp';</script>");
        }

    } catch(Exception e) {
        e.printStackTrace();
        out.println("<script>alert('오류 발생'); history.back();</script>");
    } finally {
        if(rs != null) rs.close();
        if(pstmt != null) pstmt.close();
        if(conn != null) conn.close();
    }
%>
