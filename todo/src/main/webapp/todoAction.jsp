<%@ page import="java.sql.*, todo.DBConnection" %>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%
    request.setCharacterEncoding("UTF-8");
    String userID = (String) session.getAttribute("userID");
    if(userID == null) return;

    String action = request.getParameter("action");
    Connection conn = DBConnection.getConnection();

    if("insert".equals(action)) {
        String content = request.getParameter("content");
        if(content != null && !content.trim().isEmpty()) {
            PreparedStatement psSeq = conn.prepareStatement("SELECT MAX(seq) FROM todos WHERE username=?");
            psSeq.setString(1, userID);
            ResultSet rsSeq = psSeq.executeQuery();
            int nextSeq = 0;
            if(rsSeq.next()) nextSeq = rsSeq.getInt(1) + 1;

            String sql = "INSERT INTO todos(username, content, seq) VALUES(?, ?, ?)";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setString(1, userID);
            pstmt.setString(2, content);
            pstmt.setInt(3, nextSeq);
            pstmt.executeUpdate();
        }
    } 
    else if("delete".equals(action)) {
        String id = request.getParameter("id");
        String sql = "DELETE FROM todos WHERE id=? AND username=?";
        PreparedStatement pstmt = conn.prepareStatement(sql);
        pstmt.setString(1, id);
        pstmt.setString(2, userID);
        pstmt.executeUpdate();
    }
    else if("updateStatus".equals(action)) {
        String id = request.getParameter("id");
        String status = request.getParameter("status");
        String sql = "UPDATE todos SET status=? WHERE id=? AND username=?";
        PreparedStatement pstmt = conn.prepareStatement(sql);
        pstmt.setString(1, status);
        pstmt.setString(2, id);
        pstmt.setString(3, userID);
        pstmt.executeUpdate();
    }
    else if("reorder".equals(action)) {
        String[] ids = request.getParameterValues("ids[]");
        if(ids != null) {
            String sql = "UPDATE todos SET seq=? WHERE id=? AND username=?";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            for(int i=0; i<ids.length; i++) {
                pstmt.setInt(1, i);
                pstmt.setInt(2, Integer.parseInt(ids[i]));
                pstmt.setString(3, userID);
                pstmt.addBatch();
            }
            pstmt.executeBatch();
        }
    }
    

    else if("edit".equals(action)) {
        String id = request.getParameter("id");
        String newContent = request.getParameter("content");
        
        if(newContent != null && !newContent.trim().isEmpty()) {
            String sql = "UPDATE todos SET content=? WHERE id=? AND username=?";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setString(1, newContent);
            pstmt.setString(2, id);
            pstmt.setString(3, userID);
            pstmt.executeUpdate();
        }
    }
    

    else if("updateMemo".equals(action)) {
        String id = request.getParameter("id");
        String memo = request.getParameter("memo");
        
        String sql = "UPDATE todos SET memo=? WHERE id=? AND username=?";
        PreparedStatement pstmt = conn.prepareStatement(sql);
        pstmt.setString(1, memo);
        pstmt.setString(2, id);
        pstmt.setString(3, userID);
        pstmt.executeUpdate();
        
        return; 
    }

 else if ("clearDone".equals(action)) {
     String sql = "DELETE FROM todos WHERE username=? AND status='DONE'";
     try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
         pstmt.setString(1, userID);
         pstmt.executeUpdate();
     }
 }

    conn.close();
    if(!"reorder".equals(action)) {
        response.sendRedirect("index.jsp");
    }
%>
