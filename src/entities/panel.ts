export interface Panel {
  id?: number;
  headerBg: string;
  headerText: string;
  logoBg: string;
  logoUrl?: string | null;
  alertBg: string;
  marqueeText: string;
  message: string;
  currentCardBg: string;
  currentCardText: string;
  cardText: string;
  serviceText: string;
  titleText: string;
  youtubePlaylistId: string;
  organizationCnpj: string;
}

export class Panel {
  constructor(
    public headerBg: string,
    public headerText: string,
    public logoBg: string,
    public alertBg: string,
    public marqueeText: string,
    public message: string,
    public currentCardBg: string,
    public currentCardText: string,
    public cardText: string,
    public serviceText: string,
    public titleText: string,
    public youtubePlaylistId: string,
    public organizationCnpj: string,
    public logoUrl?: string | null,
    public id?: number,
  ) {}

  static create(data: {
    id?: number;
    headerBg: string;
    headerText: string;
    logoBg: string;
    alertBg: string;
    marqueeText: string;
    message: string;
    currentCardBg: string;
    currentCardText: string;
    cardText: string;
    serviceText: string;
    titleText: string;
    youtubePlaylistId: string;
    organizationCnpj: string;
    logoUrl?: string | null;
  }): Panel {
    return new Panel(
      data.headerBg,
      data.headerText,
      data.logoBg,
      data.alertBg,
      data.marqueeText,
      data.message,
      data.currentCardBg,
      data.currentCardText,
      data.cardText,
      data.serviceText,
      data.titleText,
      data.youtubePlaylistId,
      data.organizationCnpj,
      data.logoUrl,
      data.id,
    );
  }
}
