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
            // 가장 큰 seq 값 가져오기 (새 항목을 맨 뒤에 추가하기 위함)
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
        // 드래그 앤 드롭 순서 변경
        String[] ids = request.getParameterValues("ids[]");
        if(ids != null) {
            String sql = "UPDATE todos SET seq=? WHERE id=? AND username=?";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            for(int i=0; i<ids.length; i++) {
                pstmt.setInt(1, i); // 배열 인덱스를 순서값으로 저장
                pstmt.setInt(2, Integer.parseInt(ids[i]));
                pstmt.setString(3, userID);
                pstmt.addBatch();
            }
            pstmt.executeBatch();
        }
    }
    
 // todoAction.jsp 중간에 추가

    else if("edit".equals(action)) {
        String id = request.getParameter("id");
        String newContent = request.getParameter("content");
        
        // 내용이 비어있지 않은지 서버측에서도 체크
        if(newContent != null && !newContent.trim().isEmpty()) {
            String sql = "UPDATE todos SET content=? WHERE id=? AND username=?";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setString(1, newContent);
            pstmt.setString(2, id);
            pstmt.setString(3, userID);
            pstmt.executeUpdate();
        }
    }
    
 // todoAction.jsp 중간 else if 블록들에 추가

    else if("updateMemo".equals(action)) {
        String id = request.getParameter("id");
        String memo = request.getParameter("memo");
        
        String sql = "UPDATE todos SET memo=? WHERE id=? AND username=?";
        PreparedStatement pstmt = conn.prepareStatement(sql);
        pstmt.setString(1, memo);
        pstmt.setString(2, id);
        pstmt.setString(3, userID);
        pstmt.executeUpdate();
        
        // AJAX 요청이므로 리다이렉트 하지 않음 (아무것도 출력 안 함 or 성공 메시지)
        return; 
    }
 // ... 기존 코드 사이에 추가 ...

 else if ("clearDone".equals(action)) {
     // 4번 기능: 완료된 항목 일괄 삭제
     String sql = "DELETE FROM todos WHERE username=? AND status='DONE'";
     try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
         pstmt.setString(1, userID);
         pstmt.executeUpdate();
     }
 }

 // ... 다른 else if 문들 ...



    conn.close();
    // AJAX 요청이 아닐 경우에만 리다이렉트 (드래그 처리는 AJAX로 할 것이므로)
    if(!"reorder".equals(action)) {
        response.sendRedirect("index.jsp");
    }
%>
