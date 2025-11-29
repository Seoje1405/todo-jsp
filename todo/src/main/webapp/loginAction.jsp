<%@ page import="java.sql.*, todo.DBConnection" %>
<%@ page errorPage="error.jsp" %> <%
    request.setCharacterEncoding("UTF-8"); 

    String user = request.getParameter("username");
    String pass = request.getParameter("password");

    if(user == null || user.trim().isEmpty() || pass == null || pass.trim().isEmpty()){
        throw new Exception("아이디와 비밀번호를 입력해주세요.");
    }

    Connection conn = null; 
    PreparedStatement pstmt = null;
    ResultSet rs = null;

    try {
        conn = DBConnection.getConnection();
        
        String sql = "SELECT * FROM users WHERE username=? AND password=?";
        pstmt = conn.prepareStatement(sql);
        pstmt.setString(1, user);
        pstmt.setString(2, pass);
        rs = pstmt.executeQuery();
        
        if (rs.next()) {
            session.setAttribute("userID", user);
            response.sendRedirect("index.jsp?msg=login");  
        } else {
            response.sendRedirect("login.jsp?error=true");
        }
    } catch(Exception e) {
        e.printStackTrace();
        throw e; 
    } finally {
        if(rs != null) try { rs.close(); } catch(SQLException ex) {}
        if(pstmt != null) try { pstmt.close(); } catch(SQLException ex) {}
        if(conn != null) try { conn.close(); } catch(SQLException ex) {}
    }
%>