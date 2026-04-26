Name "Monokernal"
OutFile "Monokernal Setup.exe"
InstallDir "$PROGRAMFILES\Monokernal"
RequestExecutionLevel admin

!define APPNAME "Monokernal"

Page directory
Page instfiles

Section "Install"

  SetOutPath "$INSTDIR"

  ; Copy entire app
  File /r "release\win-unpacked\*"

  ; Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"

  ; Desktop shortcut
  CreateShortcut "$DESKTOP\Monokernal.lnk" "$INSTDIR\Monokernal.exe"

  ; Start menu shortcut
  CreateDirectory "$SMPROGRAMS\${APPNAME}"
  CreateShortcut "$SMPROGRAMS\${APPNAME}\Monokernal.lnk" "$INSTDIR\Monokernal.exe"

SectionEnd


Section "Uninstall"

  Delete "$DESKTOP\Monokernal.lnk"
  Delete "$SMPROGRAMS\${APPNAME}\Monokernal.lnk"
  RMDir "$SMPROGRAMS\${APPNAME}"

  RMDir /r "$INSTDIR"

SectionEnd