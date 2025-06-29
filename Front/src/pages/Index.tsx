import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [listaDeteccao, setListaDeteccao] = useState([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith("video/") || file.type.startsWith("image/")) {
      setSelectedFile(file);
      toast({
        title: "Arquivo selecionado",
        description: `${file.name} foi selecionado com sucesso.`,
      });
    } else {
      toast({
        title: "Tipo de arquivo não suportado",
        description: "Por favor, selecione um arquivo de vídeo ou imagem.",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setIsDragging(false);
    toast({
      title: "Operação cancelada",
      description: "O arquivo selecionado foi removido."
    });
  };


  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Nenhum arquivo foi selecionado.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    var endpoint: string;
    if (selectedFile.type.startsWith("image/")) {
      formData.append("image", selectedFile);
      endpoint = "/upload";
    }else{
      formData.append("video", selectedFile);
      endpoint = "/upload_video";
    }

    setIsLoading(true);
    try {
      await fetch(`${(window as any).urlBackEnd}${endpoint}`, {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          setIsLoading(true);
          return response.json();
        })
        .then((result) => {
          const detectedClasses = result.detected_classes
            ? result.detected_classes
            : [result.detected_class];

          setListaDeteccao((prev) => [...prev, ...detectedClasses]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);

      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um erro inesperado durante o envio.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center px-4 gap-4">
      {/* Contêiner principal para os cartões */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
        <div className="w-full max-w-md space-y-8 bg-gray-50 p-8 rounded-md">
          <div className="text-center">
            <h1 className="text-4xl font-medium text-[#007AFF] mb-8">Classificações com YOLO</h1>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Envio de arquivo</h3>

              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? "border-[#007AFF] bg-blue-50"
                    : selectedFile
                    ? "border-green-400 bg-green-50"
                    : "border-gray-300 bg-white"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".mp4,image/*"
                  onChange={handleFileInputChange}
                />

                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />

                {selectedFile ? (
                  <div>
                    <p className="text-green-600 font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">Clique ou arraste o arquivo para esta área para fazer upload</p>
                    <p className="text-sm text-gray-400">Arquivos de imagem</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile}
                className="flex-1 bg-[#007AFF] hover:bg-[#0056CC] text-white"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto w-full max-w-md space-y-8 bg-gray-50 p-8 rounded-md h-96 max-w-96">
          <div className="columns-1">
            <div className="relative">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Detecções</h3>
              {isLoading && (
                <div className="absolute bottom-0 left-0 h-1 w-full bg-indigo-500 animate-loading"></div>
              )}
            </div>
            <div>
              {listaDeteccao.map((Item, index) => (
                <p key={index}>{Item}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Link na parte inferior */}
      <div className="w-full text-center mt-8">
        <a
          href="https://github.com/sergioyi"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-gray-700"
        >
          Feito por: Sergio Luan
        </a>
      </div>
    </div>
);

};

export default Index;
