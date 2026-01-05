// Google Apps Script - Surah File IDs Collector
// 
// HOW TO USE:
// 1. Go to https://script.google.com/
// 2. Create a new project
// 3. Paste this code
// 4. Update FOLDER_ID with your "Sure Hatim" folder ID
// 5. Run the main() function
// 6. Check the Logs (View > Logs) for the JSON output
// 7. Copy the output to googleDriveReciters.ts

function main() {
  // Davut Kaya (Sure Hatim) folder ID
  const FOLDER_ID = '1jJ12Enm87Ac3dUTvJ24GkCHkbvq2b9UK';
  
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files = folder.getFiles();
  
  const surahFileIds = {};
  
  while (files.hasNext()) {
    const file = files.next();
    const fileName = file.getName();
    const fileId = file.getId();
    
    // Extract surah number from filename
    // Expected format: "001Fatiha.mp3", "002Bakara.mp3", etc.
    const match = fileName.match(/^(\d{3})/);
    if (match) {
      const surahNumber = parseInt(match[1], 10);
      surahFileIds[surahNumber] = fileId;
    }
  }
  
  // Sort by surah number and output
  const sortedKeys = Object.keys(surahFileIds).map(Number).sort((a, b) => a - b);
  
  let output = 'surahFileIds: {\n';
  for (const surahNum of sortedKeys) {
    output += `            ${surahNum}: '${surahFileIds[surahNum]}',\n`;
  }
  output += '        }';
  
  console.log('=== COPY THIS TO googleDriveReciters.ts ===\n');
  console.log(output);
  console.log('\n=== Total surahs found: ' + sortedKeys.length + ' ===');
  
  return surahFileIds;
}

// Alternative: Get all reciters at once
function getAllReciters() {
  // Main folder ID (Hatim_Dosyalar)
  const MAIN_FOLDER_ID = '14IIFJzJXSzf2-MBZTvL7dcbUb9HknNAJ';
  
  const mainFolder = DriveApp.getFolderById(MAIN_FOLDER_ID);
  const reciterFolders = mainFolder.getFolders();
  
  const result = {};
  
  while (reciterFolders.hasNext()) {
    const reciterFolder = reciterFolders.next();
    const reciterName = reciterFolder.getName();
    
    // Skip non-reciter items
    if (reciterName.includes('Lütfen Okuyun')) continue;
    
    // Find "Sure Hatim" subfolder
    const subfolders = reciterFolder.getFolders();
    while (subfolders.hasNext()) {
      const subfolder = subfolders.next();
      if (subfolder.getName().includes('Sure Hatim')) {
        const files = subfolder.getFiles();
        const surahFileIds = {};
        
        while (files.hasNext()) {
          const file = files.next();
          const fileName = file.getName();
          const fileId = file.getId();
          
          const match = fileName.match(/^(\d{3})/);
          if (match) {
            const surahNumber = parseInt(match[1], 10);
            surahFileIds[surahNumber] = fileId;
          }
        }
        
        result[reciterName] = {
          folderId: subfolder.getId(),
          surahCount: Object.keys(surahFileIds).length,
          surahFileIds: surahFileIds
        };
        
        break;
      }
    }
  }
  
  console.log(JSON.stringify(result, null, 2));
  return result;
}
