import axios from "axios";

export async function getExistingShapes(canvasID: string) {
  const response = await axios.get(`/api/get-canvas-shapes/${canvasID}`);
  const messages = response.data.shapes;

  const shapes = messages.map((x: { id: number; message: string }) => {
    const messageData = JSON.parse(x.message);
    return {
      ...messageData.shape,
      dbId: x.id,
    };
  });

  return shapes;
}
