<%@ page import="java.sql.*, todo.DBConnection" %>
<%@ page errorPage="error.jsp" %> <%
    request.setCharacterEncoding("UTF-8"); // 한글 데이터 깨짐 방지

    String user = request.getParameter("username");
    String pass = request.getParameter("password");

    // 1. 입력값 유효성 검사
    if(user == null || user.trim().isEmpty() || pass == null || pass.trim().isEmpty()){
        throw new Exception("아이디와 비밀번호를 입력해주세요.");
    }

    Connection conn = null; 
    PreparedStatement pstmt = null;
    ResultSet rs = null;

    try {
        conn = DBConnection.getConnection();
        
        // 2. DB에서 아이디와 비밀번호가 일치하는 사용자 조회
        String sql = "SELECT * FROM users WHERE username=? AND password=?";
        pstmt = conn.prepareStatement(sql);
        pstmt.setString(1, user);
        pstmt.setString(2, pass);
        rs = pstmt.executeQuery();
        
        if (rs.next()) {
            // 3. 로그인 성공: 세션 생성 후 메인 페이지로 이동 (+환영 메시지 파라미터)
            session.setAttribute("userID", user);
            response.sendRedirect("index.jsp?msg=login"); 
        } else {
            // 4. 로그인 실패: 에러 파라미터와 함께 로그인 페이지로 복귀
            response.sendRedirect("login.jsp?error=true");
        }
    } catch(Exception e) {
        e.printStackTrace();
        throw e; // errorPage="error.jsp" 로 전달됨
    } finally {
        // 5. 자원 해제 (안전하게 닫기)
        if(rs != null) try { rs.close(); } catch(SQLException ex) {}
        if(pstmt != null) try { pstmt.close(); } catch(SQLException ex) {}
        if(conn != null) try { conn.close(); } catch(SQLException ex) {}
    }
%>