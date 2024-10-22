import React from 'react';
import {useTheme} from "../Theme";
import {Wrapper} from "./GridSystem";
import Loader from "./Loader";

type CardProps = {
    children: React.ReactNode;
    title?: string;
    header?: string | React.ReactNode;
    footer?: string | React.ReactNode;
    cardClass?: string;
    headerClass?: string;
    bodyClass?: string;
    footerClass?: string;
    wrapClass?: string;
    showLoader?: boolean;
    showArrow?: boolean;
};

const Card = ({
                  children,
                  title         = "",
                  header        = null,
                  footer        = null,
                  showLoader    = null,
                  showArrow     = null,
                  wrapClass     = "",
                  cardClass     = "",
                  headerClass   = "",
                  bodyClass     = "",
                  footerClass   = ""
}: CardProps) => {
  const theme = useTheme();

  return (
    <Wrapper className={wrapClass || theme.Card.wrapClass}>
        <div className={"card " + (cardClass || theme.Card.cardClass)}>
          {(header || title) &&
            <div className={"card-header " + (headerClass || theme.Card.headerClass)}>
                {title ? <h5 className="mt-2 text-nowrap">{title}</h5> : ""}
                {header}
            </div>
          }

          <div className={"card-body " + (bodyClass || theme.Card.bodyClass)}>
              <Loader show={showLoader || theme.Card.showLoader}>
                {children}
              </Loader>
          </div>
          {footer && <div className={"card-footer " + (footerClass || theme.Card.footerClass)}>{footer}</div>}
          {(showArrow || theme.Card.showArrow) &&
            <div className="card-arrow">
              <div className="card-arrow-top-left" />
              <div className="card-arrow-top-right" />
              <div className="card-arrow-bottom-left" />
              <div className="card-arrow-bottom-right" />
            </div>
          }
        </div>
    </Wrapper>
  );
};

export default Card;