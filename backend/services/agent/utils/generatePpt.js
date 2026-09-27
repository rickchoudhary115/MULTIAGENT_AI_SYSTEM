import pptxgen from "pptxgenjs";

const COLORS = {
  primary: "2563EB",
  text: "111827",
  white: "FFFFFF",
  muted: "6B7280",
};

export const generatePpt = async (data) => {
  try {
    if (!data) {
      throw new Error("PPT data is missing");
    }

    const ppt = new pptxgen();

    ppt.layout = "LAYOUT_WIDE";
    ppt.author = "CortexAI";
    ppt.title = data.title || "Presentation";

    const cover = ppt.addSlide();

    cover.background = {
      color: COLORS.primary,
    };

    cover.addText(data.title || "Presentation", {
      x: 0.8,
      y: 2.3,
      w: 11.7,
      h: 1,
      fontSize: 36,
      bold: true,
      color: COLORS.white,
      align: "center",
      margin: 0,
    });

    if (data.subtitle) {
      cover.addText(data.subtitle, {
        x: 1,
        y: 3.5,
        w: 11.3,
        h: 0.6,
        fontSize: 20,
        color: COLORS.white,
        align: "center",
        margin: 0,
      });
    }

    const slides = data.slides || [];

    slides.forEach((item, index) => {
      const slide = ppt.addSlide();

      slide.background = {
        color: COLORS.white,
      };

      slide.addText(item.title || "Untitled Slide", {
        x: 0.7,
        y: 0.5,
        w: 11.8,
        h: 0.7,
        fontSize: 28,
        bold: true,
        color: COLORS.text,
        margin: 0,
      });

      const content = item.content || item.points || [];

      slide.addText(
        content.map((point) => ({
          text: String(point),
          options: {
            bullet: {
              indent: 18,
            },
            hanging: 4,
          },
        })),
        {
          x: 0.9,
          y: 1.6,
          w: 11,
          h: 4.8,
          fontSize: 20,
          color: COLORS.text,
          breakLine: true,
          paraSpaceAfterPt: 14,
          margin: 0.05,
          fit: "shrink",
        }
      );

      slide.addText(`CortexAI  •  ${index + 1}`, {
        x: 0.7,
        y: 7,
        w: 11.8,
        h: 0.25,
        fontSize: 9,
        color: COLORS.muted,
        align: "right",
        margin: 0,
      });
    });

    const end = ppt.addSlide();

    end.background = {
      color: COLORS.primary,
    };

    end.addText("Thank You", {
      x: 0.8,
      y: 2.6,
      w: 11.7,
      h: 1,
      fontSize: 42,
      bold: true,
      color: COLORS.white,
      align: "center",
      margin: 0,
    });

    end.addText("Questions & Discussion", {
      x: 0.8,
      y: 3.8,
      w: 11.7,
      h: 0.5,
      fontSize: 20,
      color: COLORS.white,
      align: "center",
      margin: 0,
    });

    return ppt;
  } catch (error) {
    console.error("PPT Generation Error:", error);
    throw error;
  }
};


