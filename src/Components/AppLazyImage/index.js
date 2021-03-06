import React from "react";
import "./lazy-image.scss";

function elementInViewport(el) {
  const rect = el.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.top <= (window.innerHeight || document.documentElement.clientHeight)
  );
}

export default class LazyImage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
    };

    this.handleScroll = this.handleScroll.bind(this);
  }

  componentDidMount() {
    this.handleScroll();

    window.addEventListener("scroll", this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  handleScroll() {
    if (!this.state.loaded && elementInViewport(this.imgElm)) {
      // Load real image
      if (this.imgElm) {
        const imgLoader = new Image();
        imgLoader.src = this.props.src;
        imgLoader.onload = () => {
          const ratioWH = imgLoader.width / imgLoader.height;

          this.imgElm?.setAttribute(`src`, `${this.props.src}`);

          this.props.keepRatio &&
            this.imgElm?.setAttribute(
              `height`,
              `${this.props.width / ratioWH}`
            );

          this.imgElm?.classList.add(`${this.props.effect}`);

          this.setState({
            loaded: true,
          });
        };
      }
    }
  }

  render() {
    const width = this.props.width || "100%";
    const height = this.props.height || "100%";

    return (
      <img
        src={this.props.placeHolder}
        width={width}
        height={height}
        ref={(imgElm) => (this.imgElm = imgElm)}
        className="lazy-image"
        alt={this.props.alt}
      />
    );
  }
}


/* 
  placeHolder is a default image that will be shown before the real image is loaded
*/