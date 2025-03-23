import * as vscode from 'vscode';
import { getToken } from '../utils/auth';

export async function createSnippetCommand() {
  const token = getToken();

  if (!token) {
    vscode.window.showErrorMessage("🔒 You must be logged in to create a snippet.");
    return;
  }

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor found.");
    return;
  }

  const selectedCode = editor.document.getText(editor.selection);
  if (!selectedCode) {
    vscode.window.showWarningMessage("No code selected.");
    return;
  }

  const title = await vscode.window.showInputBox({
    prompt: 'Enter a title for your snippet',
    ignoreFocusOut: true,
  });
  if (!title) return;

  const tagsInput = await vscode.window.showInputBox({
    prompt: 'Enter tags (comma-separated)',
    ignoreFocusOut: true,
  });
  const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : [];

  // 🔄 Fetch workspaces
  let workspaceChoices: string[] = [];
  try {
    const res = await fetch('http://localhost:8000/api/workspaces', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error(`Failed to fetch workspaces`);

    const data = await res.json();
    const workspaces = data as { name: string }[];
    workspaceChoices = workspaces.map(ws => ws.name);

  } catch (err: any) {
    vscode.window.showErrorMessage("❌ Error fetching workspaces: " + err.message);
    return;
  }

  if (workspaceChoices.length === 0) {
    vscode.window.showWarningMessage("⚠️ No workspaces available.");
    return;
  }

  const selectedWorkspace = await vscode.window.showQuickPick(workspaceChoices, {
    placeHolder: 'Select a workspace to save your snippet'
  });

  if (!selectedWorkspace) return;

  // 🌐 POST snippet
  try {
    const res = await fetch('http://localhost:8000/api/snippets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        tags,
        workspaceName: selectedWorkspace,
        language: editor.document.languageId,
        code: selectedCode
      })
    });

    if (!res.ok) {
      const err = await res.json();
      if (err && typeof err === 'object' && 'error' in err) {
        throw new Error((err as any).error || 'Failed to save snippet');
      }
      throw new Error('Failed to save snippet');
    }

    vscode.window.showInformationMessage(`✅ Snippet "${title}" saved to "${selectedWorkspace}"`);
  } catch (err: any) {
    vscode.window.showErrorMessage("❌ Failed to save snippet: " + err.message);
  }
}
