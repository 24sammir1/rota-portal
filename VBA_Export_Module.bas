'==============================================================================
' ROTA PORTAL EXPORT MODULE
' Add this to your Excel workbook as a new module
' Creates a JSON file for uploading to the staff portal
'==============================================================================

Option Explicit

' Main export function - call this from a button
Public Sub ExportRotaForPortal()
    Dim currentWeekSheet As Worksheet
    Dim nextWeekSheet As Worksheet
    Dim staffRolesSheet As Worksheet
    Dim json As String
    Dim filePath As String
    Dim weekEnding As String
    
    On Error GoTo ErrorHandler
    
    ' Get the current week sheet (most recent non-E sheet)
    Set currentWeekSheet = GetCurrentWeekSheet()
    
    If currentWeekSheet Is Nothing Then
        MsgBox "Could not find current week's rota sheet.", vbExclamation
        Exit Sub
    End If
    
    ' Get staff roles sheet
    On Error Resume Next
    Set staffRolesSheet = ThisWorkbook.Sheets("Staff Roles")
    On Error GoTo ErrorHandler
    
    ' Extract week ending from sheet name
    weekEnding = currentWeekSheet.Name
    
    ' Build JSON
    json = "{"
    json = json & """weekEnding"": """ & weekEnding & ""","
    
    ' Extract kitchen staff
    json = json & """kitchen"": " & ExtractStaffSection(currentWeekSheet, "KITCHEN") & ","
    
    ' Extract drivers
    json = json & """drivers"": " & ExtractStaffSection(currentWeekSheet, "DRIVERS") & ","
    
    ' Extract staff roles if available
    If Not staffRolesSheet Is Nothing Then
        json = json & """staffRoles"": " & ExtractStaffRoles(staffRolesSheet)
    Else
        json = json & """staffRoles"": []"
    End If
    
    json = json & "}"
    
    ' Save file
    filePath = Application.GetSaveAsFilename( _
        InitialFileName:="rota_" & Replace(weekEnding, " ", "_") & ".json", _
        FileFilter:="JSON Files (*.json), *.json", _
        Title:="Save Rota Export")
    
    If filePath <> "False" Then
        Dim fso As Object
        Dim ts As Object
        Set fso = CreateObject("Scripting.FileSystemObject")
        Set ts = fso.CreateTextFile(filePath, True, True)
        ts.Write json
        ts.Close
        
        MsgBox "Rota exported successfully!" & vbCrLf & vbCrLf & _
               "File saved to:" & vbCrLf & filePath & vbCrLf & vbCrLf & _
               "Upload this file to the portal's Admin > Upload Rota section.", _
               vbInformation, "Export Complete"
    End If
    
    Exit Sub
    
ErrorHandler:
    MsgBox "Error exporting rota: " & Err.Description, vbCritical
End Sub

' Find the most recent non-(E) rota sheet
Private Function GetCurrentWeekSheet() As Worksheet
    Dim ws As Worksheet
    Dim sheetName As String
    Dim latestDate As Date
    Dim sheetDate As Date
    Dim latestSheet As Worksheet
    
    latestDate = DateSerial(1900, 1, 1)
    
    For Each ws In ThisWorkbook.Worksheets
        sheetName = ws.Name
        
        ' Skip (E) sheets, templates, and system sheets
        If InStr(sheetName, "(E)") = 0 And _
           InStr(sheetName, "Template") = 0 And _
           InStr(sheetName, "Summary") = 0 And _
           InStr(sheetName, "Dashboard") = 0 And _
           InStr(sheetName, "Staff Roles") = 0 And _
           InStr(sheetName, "Web Time") = 0 And _
           InStr(sheetName, "Macro") = 0 And _
           InStr(sheetName, "Named") = 0 And _
           InStr(sheetName, "OrigFmt") = 0 And _
           InStr(sheetName, "Sheet") = 0 Then
            
            ' Try to parse date from sheet name (format: DD MM YY)
            On Error Resume Next
            sheetDate = ParseSheetDate(sheetName)
            On Error GoTo 0
            
            If sheetDate > latestDate Then
                latestDate = sheetDate
                Set latestSheet = ws
            End If
        End If
    Next ws
    
    Set GetCurrentWeekSheet = latestSheet
End Function

' Parse date from sheet name format "DD MM YY"
Private Function ParseSheetDate(sheetName As String) As Date
    Dim parts() As String
    Dim d As Integer, m As Integer, y As Integer
    
    parts = Split(Trim(sheetName), " ")
    
    If UBound(parts) >= 2 Then
        d = CInt(parts(0))
        m = CInt(parts(1))
        y = CInt(parts(2))
        If y < 100 Then y = y + 2000
        ParseSheetDate = DateSerial(y, m, d)
    Else
        ParseSheetDate = DateSerial(1900, 1, 1)
    End If
End Function

' Extract staff data from a section (KITCHEN or DRIVERS)
Private Function ExtractStaffSection(ws As Worksheet, sectionName As String) As String
    Dim startRow As Long
    Dim endRow As Long
    Dim row As Long
    Dim staffName As String
    Dim json As String
    Dim isFirst As Boolean
    
    ' Find section start
    startRow = 0
    For row = 1 To 100
        If UCase(Trim(CStr(ws.Cells(row, 3).Value))) = sectionName Then
            startRow = row + 2 ' Skip header rows
            Exit For
        End If
    Next row
    
    If startRow = 0 Then
        ExtractStaffSection = "[]"
        Exit Function
    End If
    
    ' Find section end (next section or empty)
    endRow = startRow
    For row = startRow To 200 Step 2 ' Staff on alternating rows
        staffName = Trim(CStr(ws.Cells(row, 3).Value))
        If staffName = "" Then
            ' Check if it's a new section
            If UCase(Trim(CStr(ws.Cells(row, 3).Value))) = "DRIVERS" Or _
               UCase(Trim(CStr(ws.Cells(row + 1, 3).Value))) = "DRIVERS" Then
                Exit For
            End If
        ElseIf UCase(staffName) = "DRIVERS" Then
            Exit For
        Else
            endRow = row
        End If
    Next row
    
    ' Build JSON array
    json = "["
    isFirst = True
    
    For row = startRow To endRow Step 2
        staffName = Trim(CStr(ws.Cells(row, 3).Value))
        
        If staffName <> "" And UCase(staffName) <> "DRIVERS" Then
            If Not isFirst Then json = json & ","
            isFirst = False
            
            json = json & "{"
            json = json & """name"": """ & EscapeJson(staffName) & ""","
            json = json & """shifts"": " & ExtractShifts(ws, row) & ","
            json = json & """totalHours"": """ & FormatTotalHours(ws.Cells(row, 39).Value) & """"
            json = json & "}"
        End If
    Next row
    
    json = json & "]"
    ExtractStaffSection = json
End Function

' Extract shifts for a staff member row
Private Function ExtractShifts(ws As Worksheet, row As Long) As String
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
        
        timeIn = FormatTimeValue(ws.Cells(row, dayCols(i)).Value)
        timeOut = FormatTimeValue(ws.Cells(row, dayCols(i) + 1).Value)
        role = Trim(CStr(ws.Cells(row, dayCols(i) + 4).Value)) ' E column (role)
        
        json = json & """" & days(i) & """: {"
        json = json & """timeIn"": """ & timeIn & ""","
        json = json & """timeOut"": """ & timeOut & ""","
        json = json & """role"": """ & EscapeJson(role) & """"
        json = json & "}"
    Next i
    
    json = json & "}"
    ExtractShifts = json
End Function

' Format time value to HH:MM string
Private Function FormatTimeValue(val As Variant) As String
    If IsEmpty(val) Or val = "" Then
        FormatTimeValue = ""
    ElseIf IsDate(val) Then
        FormatTimeValue = Format(val, "HH:MM")
    ElseIf IsNumeric(val) Then
        ' Handle time as decimal
        FormatTimeValue = Format(val, "HH:MM")
    Else
        FormatTimeValue = CStr(val)
    End If
End Function

' Format total hours
Private Function FormatTotalHours(val As Variant) As String
    If IsEmpty(val) Or val = "" Then
        FormatTotalHours = "0:00"
    ElseIf IsDate(val) Then
        FormatTotalHours = Format(val, "H:MM")
    ElseIf IsNumeric(val) Then
        Dim totalMinutes As Long
        totalMinutes = val * 24 * 60
        FormatTotalHours = Int(totalMinutes / 60) & ":" & Format(totalMinutes Mod 60, "00")
    Else
        FormatTotalHours = CStr(val)
    End If
End Function

' Extract staff roles
Private Function ExtractStaffRoles(ws As Worksheet) As String
    Dim json As String
    Dim row As Long
    Dim staffName As String
    Dim roles As String
    Dim notes As String
    Dim isFirst As Boolean
    
    json = "["
    isFirst = True
    
    For row = 2 To 100 ' Start from row 2 (skip header)
        staffName = Trim(CStr(ws.Cells(row, 1).Value))
        
        If staffName = "" Then Exit For
        
        roles = Trim(CStr(ws.Cells(row, 2).Value))
        notes = Trim(CStr(ws.Cells(row, 3).Value))
        
        If Not isFirst Then json = json & ","
        isFirst = False
        
        json = json & "{"
        json = json & """name"": """ & EscapeJson(staffName) & ""","
        json = json & """roles"": """ & EscapeJson(roles) & ""","
        json = json & """notes"": """ & EscapeJson(notes) & """"
        json = json & "}"
    Next row
    
    json = json & "]"
    ExtractStaffRoles = json
End Function

' Escape special characters for JSON
Private Function EscapeJson(str As String) As String
    Dim result As String
    result = str
    result = Replace(result, "\", "\\")
    result = Replace(result, """", "\""")
    result = Replace(result, vbCr, "\r")
    result = Replace(result, vbLf, "\n")
    result = Replace(result, vbTab, "\t")
    EscapeJson = result
End Function

'==============================================================================
' OPTIONAL: Add a button to your worksheet that calls ExportRotaForPortal
' 
' To add a button:
' 1. Go to Developer tab > Insert > Button (Form Control)
' 2. Draw the button on your sheet
' 3. When prompted, assign the macro "ExportRotaForPortal"
' 4. Right-click the button and edit text to "Export for Portal"
'==============================================================================
