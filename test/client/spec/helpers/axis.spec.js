/* global sinon */
/* eslint-disable no-unused-expressions,react/no-multi-comp */
import Axis from "src/helpers/axis";
import { Scale } from "victory-core";
import React from "react";
import { VictoryAxis, VictoryBar } from "src/index";

describe("helpers/axis", () => {
  const getVictoryAxis = (props) => React.createElement(VictoryAxis, props);
  const getVictoryBar = (props) => React.createElement(VictoryBar, props);

  describe("getAxisComponent", () => {
    const dependentAxis = getVictoryAxis({ dependentAxis: true });
    const independentAxis = getVictoryAxis({ dependentAxis: false });
    const bar = getVictoryBar({});

    let sandbox;
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.spy(dependentAxis.type, "getAxis");
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("returns the independent axis when called with 'x'", () => {
      const childComponents = [dependentAxis, independentAxis, bar];
      const componentResult = Axis.getAxisComponent(childComponents, "x");
      expect(dependentAxis.type.getAxis).calledWith(dependentAxis.props)
        .and.returned("y");
      expect(independentAxis.type.getAxis).calledWith(independentAxis.props)
        .and.returned("x");
      expect(componentResult).to.eql(independentAxis);
    });
  });

  describe("getTickFormat", () => {
    let sandbox;
    const scale = Scale.getBaseScale({ scale: { x: "linear" } }, "x");
    const ticks = [1, 2, 3, 4, 5];
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.spy(Axis, "stringTicks");
      sandbox.stub(scale, "tickFormat");
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("returns tickFormat function from props", () => {
      const props = { tickFormat: (x) => x * 5 };
      const tickProps = { scale, ticks };
      const formatResult = Axis.getTickFormat(props, tickProps);
      expect(Axis.stringTicks).notCalled;
      expect(scale.tickFormat).notCalled;
      expect(formatResult).to.eql(props.tickFormat);
    });

    it("converts tickFormat array from props to a function", () => {
      const props = { tickFormat: [1, 2, 3, 4, 5] };
      const tickProps = { scale, ticks };
      const formatResult = Axis.getTickFormat(props, tickProps);
      expect(Axis.stringTicks).notCalled;
      expect(scale.tickFormat).notCalled;
      expect(formatResult).to.be.a("function");
    });

    it("converts tickFormat string array from props to a function", () => {
      const props = { tickValues: ["cats", "dogs", "birds"] };
      const tickProps = { scale, ticks };
      const formatResult = Axis.getTickFormat(props, tickProps);
      expect(Axis.stringTicks).calledWith(props).and.returned(true);
      expect(scale.tickFormat).notCalled;
      expect(formatResult).to.be.a("function");
    });

    it("calculates a tick format from scale", () => {
      const props = {};
      const tickProps = { scale, ticks };
      const formatResult = Axis.getTickFormat(props, tickProps);
      expect(Axis.stringTicks).calledWith(props).and.returned(false);
      expect(formatResult).to.be.a("function");
    });
  });

  describe("getTicks", () => {
    let sandbox;
    const scale = Scale.getBaseScale({ scale: { x: "linear" } }, "x");
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.spy(scale, "ticks");
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("returns tickValues from props", () => {
      const props = { tickValues: [1, 2, 3] };
      const tickResult = Axis.getTicks(props);
      expect(tickResult).to.eql(props.tickValues);
    });

    it("returns converts string tickValues to numbers", () => {
      const props = { tickValues: ["a", "b", "c", "d"] };
      const tickResult = Axis.getTicks(props);
      expect(tickResult).to.eql([1, 2, 3, 4]);
    });

    it("calculates tickValues from scale.ticks()", () => {
      const props = { tickCount: 5 };
      Axis.getTicks(props, scale);
      expect(scale.ticks).calledWith(5);
    });

    it("calculates tickValues from scale.ticks(), and removes zero if axes cross", () => {
      const props = { tickCount: 5, crossAxis: true };
      const tickResult = Axis.getTicks(props, scale);
      expect(scale.ticks).calledWith(5);
      expect(tickResult).to.be.an("array").and.not.have.members([0]);
    });
  });
});
