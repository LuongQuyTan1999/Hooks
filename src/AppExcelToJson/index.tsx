import { useState } from "react";
import * as XLSX from "xlsx";

const AppExcelToJson = () => {
  const [currentFile, setCurrentFile] = useState<Blob | null>(null);
  const [currentHeader, setCurrentHeader] = useState<string[]>([]);
  const [dataExcel, setDataExcel] = useState<string>("");

  const onUpload = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    const file = e.target.files[0];
    setCurrentFile(file);
  };

  const convertToJson = (csv: string) => {
    const lines = csv.split("\n");
    const result = [];
    const headers = lines[0].split(",");
    setCurrentHeader(headers);

    for (var i = 1; i < lines.length; i++) {
      const obj = {} as any;
      const currentLine = lines[i].split(",") as any; // Generator header Excel horizontal
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j].toLowerCase()] = currentLine[j];
      }
      result.push(obj);
    }

    return JSON.stringify(result);
  };
  const onReadFile = () => {
    const reader = new FileReader();
    reader.onload = (evt: ProgressEvent<FileReader>) => {
      if (!evt) return;
      const bstr = evt?.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_csv(ws);
      const dataJson = convertToJson(data);
      if (dataJson) setDataExcel(JSON.parse(dataJson));
    };

    if (currentFile) {
      reader.readAsBinaryString(currentFile);
    }
  };

  const data = dataExcel;
  return (
    <div>
      <h1>Excel to Json</h1>
      <button onClick={onReadFile}>Read file</button>
      <input type="file" onChange={onUpload} />

      {/* <AppTableGenerator data={data} headers={currentHeader} /> */}
    </div>
  );
};

export default AppExcelToJson;
