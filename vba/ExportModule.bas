'==============================================================================
' ROTA PORTAL EXPORT MODULE
' Add this code to a new module in your Excel workbook
' 
' This module exports your rota data to JSON format for the staff portal
'==============================================================================

Option Explicit

' Main export function - creates JSON file for portal upload
Sub ExportForPortal()
    Dim ws As Worksheet
    Dim currentWeekSheet As String
    Dim nextWeekSheet As String
    Dim jsonContent As String
    Dim filePath As String
    Dim fso As Object
    Dim file As Object
    
    ' Find the most recent non-(E) sheet (current week)
    currentWeekSheet = GetMostRecentRotaSheet()
    
    If currentWeekSheet = "" Then
        MsgBox "No rota sheet found!", vbExclamation
        Exit Sub
    End If
    
    ' Try to find next week's sheet
    nextWeekSheet = GetNextWeekSheet(currentWeekSheet)
    
    ' Build JSON
    jsonContent = "{"
    jsonContent = jsonContent & """weekEnding"": """ & currentWeekSheet & ""","
    
    ' Export current week
    jsonContent = jsonContent & """kitchen"": " & ExportStaffSection(currentWeekSheet, "KITCHEN") & ","
    jsonContent = jsonContent & """drivers"": " & ExportStaffSection(currentWeekSheet, "DRIVERS") & ","
    
    ' Export staff roles
    jsonContent = jsonContent & """staffRoles"": " & ExportStaffRoles()
    
    jsonContent = jsonContent & "}"
    
    ' Save to file
    filePath = Application.GetSaveAsFilename( _
        InitialFileName:="rota_export_" & Replace(currentWeekSheet, " ", "_") & ".json", _
        FileFilter:="JSON Files (*.json), *.json")
    
    If filePath = "False" Then Exit Sub
    
    Set fso = CreateObject("Scripting.FileSystemObject")
    Set file = fso.CreateTextFile(filePath, True, True)
    file.Write jsonContent
    file.Close
    
    MsgBox "Rota exported successfully!" & vbCrLf & vbCrLf & _
           "File saved to:" & vbCrLf & filePath & vbCrLf & vbCrLf & _
           "Upload this file to the portal's Admin > Upload Rota section.", _
           vbInformation, "Export Complete"
End Sub

' Get the most recent rota sheet name (excluding (E) sheets)
Function GetMostRecentRotaSheet() As String
    Dim ws As Worksheet
    Dim sheetName As String
    Dim latestDate As Date
    Dim sheetDate As Date
    Dim latestSheet As String
    
    latestDate = DateSerial(1900, 1, 1)
    latestSheet = ""
    
    For Each ws In ThisWorkbook.Worksheets
        sheetName = ws.Name
        ' Skip (E) sheets, OrigFmt sheets, and other non-rota sheets
        If InStr(sheetName, "(E)") = 0 And _
           InStr(sheetName, "OrigFmt") = 0 And _
           InStr(sheetName, "Sheet") = 0 And _
           InStr(sheetName, "Template") = 0 And _
           InStr(sheetName, "Summary") = 0 And _
           InStr(sheetName, "Dashboard") = 0 And _
           InStr(sheetName, "Staff Roles") = 0 And _
           InStr(sheetName, "Web Time") = 0 And _
           InStr(sheetName, "Macro") = 0 And _
           InStr(sheetName, "Named") = 0 Then
            
            ' Try to parse as date (DD MM YY format)
            On Error Resume Next
            sheetDate = ParseSheetDate(sheetName)
            On Error GoTo 0
            
            If sheetDate > latestDate Then
                latestDate = sheetDate
                latestSheet = sheetName
            End If
        End If
    Next ws
    
    GetMostRecentRotaSheet = latestSheet
End Function

' Parse sheet name to date (format: DD MM YY)
Function ParseSheetDate(sheetName As String) As Date
    Dim parts() As String
    parts = Split(Trim(sheetName), " ")
    
    If UBound(parts) >= 2 Then
        ParseSheetDate = DateSerial(2000 + CInt(parts(2)), CInt(parts(1)), CInt(parts(0)))
    Else
        ParseSheetDate = DateSerial(1900, 1, 1)
    End If
End Function

' Get next week's sheet if it exists
Function GetNextWeekSheet(currentSheet As String) As String
    Dim currentDate As Date
    Dim nextDate As Date
    Dim nextSheetName As String
    
    currentDate = ParseSheetDate(currentSheet)
    nextDate = currentDate + 7
    
    nextSheetName = Format(Day(nextDate), "00") & " " & _
                    Format(Month(nextDate), "00") & " " & _
                    Format(Year(nextDate) Mod 100, "00")
    
    On Error Resume Next
    If Not ThisWorkbook.Sheets(nextSheetName) Is Nothing Then
        GetNextWeekSheet = nextSheetName
    Else
        GetNextWeekSheet = ""
    End If
    On Error GoTo 0
End Function

' Export a staff section (KITCHEN or DRIVERS)
Function ExportStaffSection(sheetName As String, sectionName As String) As String
    Dim ws As Worksheet
    Dim row As Long
    Dim startRow As Long
    Dim endRow As Long
    Dim staffName As String
    Dim json As String
    Dim staffJson As String
    Dim isFirst As Boolean
    
    Set ws = ThisWorkbook.Sheets(sheetName)
    
    ' Find section start
    startRow = 0
    For row = 1 To 100
        If Trim(UCase(ws.Cells(row, 3).Value)) = sectionName Then
            startRow = row + 2 ' Skip header rows
            Exit For
        End If
    Next row
    
    If startRow = 0 Then
        ExportStaffSection = "[]"
        Exit Function
    End If
    
    ' Find section end (next section or empty rows)
    endRow = startRow
    For row = startRow To 200 Step 2 ' Staff on every other row
        staffName = Trim(ws.Cells(row, 3).Value)
        If staffName = "" Or UCase(staffName) = "DRIVERS" Then
            Exit For
        End If
        endRow = row
    Next row
    
    ' Build JSON array
    json = "["
    isFirst = True
    
    For row = startRow To endRow Step 2
        staffName = Trim(ws.Cells(row, 3).Value)
        If staffName <> "" And UCase(staffName) <> "DRIVERS" Then
            If Not isFirst Then json = json & ","
            isFirst = False
            
            staffJson = "{"
            staffJson = staffJson & """name"": """ & EscapeJson(staffName) & ""","
            staffJson = staffJson & """shifts"": " & ExportShifts(ws, row) & ","
            staffJson = staffJson & """totalHours"": """ & FormatHours(ws.Cells(row, 39).Value) & """"
            staffJson = staffJson & "}"
            
            json = json & staffJson
        End If
    Next row
    
    json = json & "]"
    ExportStaffSection = json
End Function

' Export shifts for a single staff member
Function ExportShifts(ws As Worksheet, row As Long) As String
    Dim json As String
    Dim days As Variant
    Dim dayCols As Variant
    Dim i As Integer
    Dim timeIn As String
    Dim timeOut As String
    Dim role As String
    
    days = Array("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
    dayCols = Array(4, 9, 14, 19, 24, 29, 34) ' Starting columns for each day
    
    json = "{"
    
    For i = 0 To 6
        If i > 0 Then json = json & ","
        
        timeIn = FormatTime(ws.Cells(row, dayCols(i)).Value)
        timeOut = FormatTime(ws.Cells(row, dayCols(i) + 1).Value)
        role = Trim(ws.Cells(row, dayCols(i) + 4).Value) ' Role is in column D+4 from time in
        
        json = json & """" & days(i) & """: {"
        json = json & """timeIn"": """ & timeIn & ""","
        json = json & """timeOut"": """ & timeOut & ""","
        json = json & """role"": """ & EscapeJson(role) & """"
        json = json & "}"
    Next i
    
    json = json & "}"
    ExportShifts = json
End Function

' Export staff roles from Staff Roles sheet
Function ExportStaffRoles() As String
    Dim ws As Worksheet
    Dim row As Long
    Dim json As String
    Dim staffName As String
    Dim roles As String
    Dim notes As String
    Dim isFirst As Boolean
    
    On Error Resume Next
    Set ws = ThisWorkbook.Sheets("Staff Roles")
    On Error GoTo 0
    
    If ws Is Nothing Then
        ExportStaffRoles = "[]"
        Exit Function
    End If
    
    json = "["
    isFirst = True
    
    For row = 2 To 100 ' Start from row 2, skip header
        staffName = Trim(ws.Cells(row, 1).Value)
        If staffName = "" Then Exit For
        
        roles = Trim(ws.Cells(row, 2).Value)
        notes = Trim(ws.Cells(row, 3).Value)
        
        If Not isFirst Then json = json & ","
        isFirst = False
        
        json = json & "{"
        json = json & """name"": """ & EscapeJson(staffName) & ""","
        json = json & """roles"": """ & EscapeJson(roles) & ""","
        json = json & """notes"": """ & EscapeJson(notes) & """"
        json = json & "}"
    Next row
    
    json = json & "]"
    ExportStaffRoles = json
End Function

' Format time value to HH:MM string
Function FormatTime(val As Variant) As String
    If IsEmpty(val) Or val = "" Then
        FormatTime = ""
    ElseIf IsDate(val) Then
        FormatTime = Format(val, "HH:MM")
    ElseIf IsNumeric(val) Then
        ' Might be a time serial
        FormatTime = Format(val, "HH:MM")
    Else
        FormatTime = CStr(val)
    End If
End Function

' Format hours value
Function FormatHours(val As Variant) As String
    If IsEmpty(val) Or val = "" Then
        FormatHours = "0:00"
    ElseIf IsDate(val) Then
        FormatHours = Format(val, "H:MM")
    ElseIf IsNumeric(val) Then
        Dim hours As Long
        Dim mins As Long
        hours = Int(val * 24)
        mins = (val * 24 - hours) * 60
        FormatHours = hours & ":" & Format(mins, "00")
    Else
        FormatHours = CStr(val)
    End If
End Function

' Escape special characters for JSON
Function EscapeJson(str As String) As String
    Dim result As String
    result = str
    result = Replace(result, "\", "\\")
    result = Replace(result, """", "\""")
    result = Replace(result, vbCr, "")
    result = Replace(result, vbLf, "")
    result = Replace(result, vbTab, " ")
    EscapeJson = result
End Function
