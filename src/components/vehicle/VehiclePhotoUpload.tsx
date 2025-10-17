import React, { useState, useEffect } from 'react';
import {
  Upload,
  Button,
  Card,
  Image,
  Typography,
  Space,
  Select,
  Input,
  Tag,
  message,
  Row,
  Col,
  Modal,
  Alert,
  Progress
} from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  StarOutlined,
  StarFilled,
  CameraOutlined
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { vehiclePhotosAPI } from '../../services/api';
import { usePermissions } from '../../hooks/usePermissions';

// Temporary inline types to bypass import issues
interface VehiclePhoto {
  id: number;
  vehicleId: number;
  photoUrl: string;
  photoType: string;
  description?: string;
  inspectionType?: string;
  isPrimary: boolean;
  takenAt: string;
  takenByUserId?: number;
  createdAt: string;
}

enum PhotoType {
  GENERAL = 'GENERAL',
  EXTERIOR = 'EXTERIOR',
  INTERIOR = 'INTERIOR',
  ENGINE = 'ENGINE',
  DAMAGE = 'DAMAGE'
}

enum InspectionType {
  PICKUP = 'PICKUP',
  RETURN = 'RETURN',
  MAINTENANCE = 'MAINTENANCE',
  GENERAL = 'GENERAL'
}

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface VehiclePhotoUploadProps {
  vehicleId: number;
  vehicleName?: string;
  onPhotosChange?: (photos: VehiclePhoto[]) => void;
}

export const VehiclePhotoUpload: React.FC<VehiclePhotoUploadProps> = ({
  vehicleId,
  vehicleName,
  onPhotosChange
}) => {
  const { canUploadPhotos } = usePermissions();
  const [photos, setPhotos] = useState<VehiclePhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [photoType, setPhotoType] = useState<string>(PhotoType.GENERAL);
  const [inspectionType, setInspectionType] = useState<string>(InspectionType.GENERAL);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const vehiclePhotos = await vehiclePhotosAPI.getVehiclePhotos(vehicleId);
      setPhotos(vehiclePhotos);
      onPhotosChange?.(vehiclePhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
      message.error('Error al cargar las fotos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [vehicleId]);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('Por favor selecciona al menos una foto');
      return;
    }

    setUploading(true);

    try {
      for (const file of fileList) {
        if (file.originFileObj) {
          await vehiclePhotosAPI.uploadPhoto(
            vehicleId,
            file.originFileObj,
            photoType,
            description || undefined,
            inspectionType !== InspectionType.GENERAL ? inspectionType : undefined
          );
        }
      }

      message.success('Fotos subidas exitosamente');
      setFileList([]);
      setDescription('');
      await loadPhotos();
    } catch (error) {
      console.error('Error uploading photos:', error);
      message.error('Error al subir las fotos');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId: number) => {
    try {
      await vehiclePhotosAPI.deletePhoto(photoId);
      message.success('Foto eliminada');
      await loadPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      message.error('Error al eliminar la foto');
    }
  };

  const handleSetPrimary = async (photoId: number) => {
    try {
      await vehiclePhotosAPI.setPrimaryPhoto(photoId, vehicleId);
      message.success('Foto principal establecida');
      await loadPhotos();
    } catch (error) {
      console.error('Error setting primary photo:', error);
      message.error('Error al establecer foto principal');
    }
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewVisible(true);
  };

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });

  const hasMinimumPhotos = photos.length >= 5;
  const generalPhotos = photos.filter(p => p.photoType === PhotoType.GENERAL);
  const exteriorPhotos = photos.filter(p => p.photoType === PhotoType.EXTERIOR);
  const interiorPhotos = photos.filter(p => p.photoType === PhotoType.INTERIOR);

  return (
    <Card title={
      <Space>
        <CameraOutlined />
        <span>Fotos del Vehículo {vehicleName && `- ${vehicleName}`}</span>
        {hasMinimumPhotos ? (
          <Tag color="green">✓ Mínimo 5 fotos</Tag>
        ) : (
          <Tag color="orange">Faltan {5 - photos.length} fotos</Tag>
        )}
      </Space>
    }>
      {/* Alert about minimum photos requirement */}
      {!hasMinimumPhotos && (
        <Alert
          message="Fotos Mínimas Requeridas"
          description="Se requieren al menos 5 fotos del vehículo. Las fotos generales son obligatorias."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Photo upload section */}
      {canUploadPhotos() && (
        <Card size="small" title="Subir Nuevas Fotos" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Tipo de Foto:</Text>
                <Select
                  value={photoType}
                  onChange={setPhotoType}
                  style={{ width: '100%' }}
                >
                  <Option value={PhotoType.GENERAL}>General</Option>
                  <Option value={PhotoType.EXTERIOR}>Exterior</Option>
                  <Option value={PhotoType.INTERIOR}>Interior</Option>
                  <Option value={PhotoType.ENGINE}>Motor</Option>
                  <Option value={PhotoType.DAMAGE}>Daños</Option>
                </Select>
              </Space>
            </Col>
            <Col span={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Tipo de Inspección:</Text>
                <Select
                  value={inspectionType}
                  onChange={setInspectionType}
                  style={{ width: '100%' }}
                >
                  <Option value={InspectionType.GENERAL}>General</Option>
                  <Option value={InspectionType.PICKUP}>Entrega</Option>
                  <Option value={InspectionType.RETURN}>Devolución</Option>
                  <Option value={InspectionType.MAINTENANCE}>Mantenimiento</Option>
                </Select>
              </Space>
            </Col>
            <Col span={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Descripción (Opcional):</Text>
                <TextArea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción de la foto..."
                  rows={3}
                />
              </Space>
            </Col>
          </Row>

          <Upload
            fileList={fileList}
            onPreview={handlePreview}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false}
            accept="image/*"
            multiple
            listType="picture-card"
            style={{ marginTop: 16 }}
          >
            {fileList.length < 8 && (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Seleccionar</div>
              </div>
            )}
          </Upload>

          <Button
            type="primary"
            onClick={handleUpload}
            loading={uploading}
            disabled={fileList.length === 0}
            style={{ marginTop: 16 }}
          >
            <UploadOutlined /> Subir Fotos
          </Button>
        </Card>
      )}

      {/* Photo progress indicator */}
      <div style={{ marginBottom: 16 }}>
        <Text strong>Progreso de Fotos: </Text>
        <Progress
          percent={Math.min((photos.length / 5) * 100, 100)}
          status={hasMinimumPhotos ? 'success' : 'active'}
          strokeColor={hasMinimumPhotos ? '#52c41a' : '#1890ff'}
        />
      </div>

      {/* Existing photos display */}
      <Title level={5}>Fotos Actuales ({photos.length})</Title>

      {loading ? (
        <div>Cargando fotos...</div>
      ) : photos.length === 0 ? (
        <Text type="secondary">No hay fotos cargadas para este vehículo</Text>
      ) : (
        <Row gutter={[16, 16]}>
          {photos.map((photo) => (
            <Col key={photo.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                size="small"
                cover={
                  <Image
                    src={photo.photoUrl}
                    height={150}
                    style={{ objectFit: 'cover' }}
                    preview={{
                      mask: <EyeOutlined />
                    }}
                  />
                }
                actions={[
                  <Button
                    type="text"
                    icon={photo.isPrimary ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                    onClick={() => handleSetPrimary(photo.id)}
                    title={photo.isPrimary ? 'Foto principal' : 'Establecer como principal'}
                  />,
                  canUploadPhotos() && (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(photo.id)}
                      title="Eliminar foto"
                    />
                  )
                ].filter(Boolean)}
              >
                <Card.Meta
                  title={
                    <Space>
                      <Tag color="blue">{photo.photoType}</Tag>
                      {photo.isPrimary && <Tag color="gold">Principal</Tag>}
                    </Space>
                  }
                  description={
                    <div>
                      {photo.inspectionType && (
                        <Tag size="small" color="green">{photo.inspectionType}</Tag>
                      )}
                      {photo.description && (
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 4 }}>
                          {photo.description}
                        </Text>
                      )}
                      <Text type="secondary" style={{ fontSize: '10px', display: 'block', marginTop: 4 }}>
                        {new Date(photo.takenAt).toLocaleDateString()}
                      </Text>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Preview modal */}
      <Modal
        open={previewVisible}
        title="Vista Previa"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </Card>
  );
};